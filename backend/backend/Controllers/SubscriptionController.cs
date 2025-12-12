using backend.Data;
using backend.Models;
using backend.Services;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/subscriptions")]
    [Authorize]
    public class SubscriptionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogService _logService;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;
        private readonly IPdfService _pdfService;
        private readonly IConfiguration _configuration;
        private readonly IPricingService _pricingService;

        public SubscriptionsController(ApplicationDbContext context, ILogService logService, IEmailService emailService,
            INotificationService notificationService, IPdfService pdfService,
            IConfiguration configuration, IPricingService pricingService)
        {
            _context = context;
            _logService = logService;
            _emailService = emailService;
            _notificationService = notificationService;
            _pdfService = pdfService;
            _configuration = configuration;
            _pricingService = pricingService;
        }

        private int CalculateAge(DateTime birthDate)
        {
            var today = DateTime.UtcNow;
            var age = today.Year - birthDate.Year;
            if (birthDate.Date > today.AddYears(-age)) age--;
            return age;
        }

        [HttpPost("{packageId}")]
        public async Task<IActionResult> Subscribe(int packageId, [FromBody] SubscribeDto dto)
        {
            var userIdOrEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdOrEmail))
                return Unauthorized(new { Message = "Brak identyfikatora w tokenie." });

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userIdOrEmail || u.Email == userIdOrEmail);

            if (user == null)
            {
                await _logService.LogAsync("SUBSCRIBE_FAILED", $"Brak usera: {userIdOrEmail}", "System", null, "Error");
                return BadRequest(new { Message = "Nie znaleziono użytkownika." });
            }

            if (!string.IsNullOrEmpty(user.Pesel))
            {
                if (user.Pesel != dto.Pesel)
                    return BadRequest(new
                    {
                        Message =
                            "Podany numer PESEL różni się od przypisanego do Twojego konta. Skontaktuj się z obsługą, jeśli dane są błędne."
                    });
            }
            else
            {
                var peselTaken = await _context.Users.AnyAsync(u => u.Pesel == dto.Pesel && u.Id != user.Id);
                if (peselTaken)
                {
                    return BadRequest(new { Message = "Ten numer PESEL jest już powiązany z innym kontem." });
                }

                user.Pesel = dto.Pesel;
            }

            var package = await _context.Packages.FindAsync(packageId);
            if (package == null) return NotFound(new { Message = "Taki pakiet nie istnieje." });

            var option = _pricingService.GetOption(dto.Duration);
            if (option == null) return BadRequest(new { Message = "Nieprawidłowa opcja subskrypcji." });

            if (package.Category == "Biznesowy")
            {
                await _logService.LogAsync("UNAUTHORIZED_PURCHASE_ATTEMPT",
                    $"Próba zakupu pakietu B2B przez API: {package.Name}, User: {user.Email}",
                    "System",
                    user.Id,
                    "Warning",
                    true);

                return BadRequest(new
                {
                    Message =
                        "Pakiety biznesowe nie są dostępne w sprzedaży online. Prosimy o kontakt z działem sprzedaży."
                });
            }

            var birthDate = user.BirthDate ?? DateTime.UtcNow;
            var age = CalculateAge(birthDate);

            decimal ageMultiplier = 1.0m;
            if (package.Category == "Indywidualny")
            {
                if (age > 30 && age <= 50)
                {
                    ageMultiplier += (decimal)((age - 30) * 0.015);
                }
                else if (age > 50)
                {
                    ageMultiplier += 0.30m + (decimal)((age - 50) * 0.025);
                }
            }

            var basePriceWithAge = package.PriceValue * ageMultiplier;
            decimal calculatedAmount =
                _pricingService.CalculateFinalPrice(basePriceWithAge, dto.Duration, dto.BillingPeriod);

            DateTime effectiveStartDate = dto.StartDate.HasValue && dto.StartDate.Value > DateTime.UtcNow
                ? dto.StartDate.Value.ToUniversalTime()
                : DateTime.UtcNow;

            DateTime effectiveEndDate;
            string priceString;

            string formattedPrice = calculatedAmount % 1 == 0
                ? $"{Math.Round(calculatedAmount, 0)}"
                : $"{calculatedAmount:F2}";

            if (dto.Duration == "7d")
            {
                effectiveEndDate = effectiveStartDate.AddDays(7).AddDays(-1);
                priceString = $"{formattedPrice} zł (Test)";
            }
            else
            {
                if (dto.BillingPeriod == "monthly")
                {
                    effectiveEndDate = effectiveStartDate.AddMonths(1).AddDays(-1);
                    priceString = $"{formattedPrice} zł / mies";
                }
                else
                {
                    int monthsToCheck = dto.Duration == "24m" ? 24 : 12;
                    effectiveEndDate = effectiveStartDate.AddMonths(monthsToCheck).AddDays(-1);
                    priceString = $"{formattedPrice} zł";
                }
            }

            effectiveEndDate = effectiveEndDate.Date.AddHours(23).AddMinutes(59).AddSeconds(59);

            var subscription = new UserPackage
            {
                User = user,
                UserId = user.Id,
                Package = package,
                PackageId = packageId,
                StartDate = effectiveStartDate,
                EndDate = effectiveEndDate,
                Status = "Active",
                PriceAtPurchase = $"{formattedPrice} zł" + (dto.BillingPeriod == "monthly" ? " / mies" : ""),
                Street = dto.Street,
                HouseNumber = dto.HouseNumber,
                City = dto.City,
                ZipCode = dto.ZipCode,
                Pesel = dto.Pesel,
                PaymentMethod = dto.PaymentMethod,
                TransactionId = dto.TransactionId
            };

            _context.UserPackages.Add(subscription);
            await _context.SaveChangesAsync();

            await _logService.LogAsync("SUBSCRIBE_SUCCESS", $"Zakup: {package.Name}, ID: {subscription.Id}", user.Email,
                user.Id, "Success");
            var frontendUrl = _configuration["FrontendUrl"];

            var termsLink = $"{frontendUrl}/regulamin";
            var privacyLink = $"{frontendUrl}/polityka-prywatnosci";
            try
            {
                byte[] pdfBytes = _pdfService.GenerateCertificate(subscription, user);
                var emailBody = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Potwierdzenie Zamówienia</title>
                </head>
                <body style='margin: 0; padding: 0; background-color: #f3f4f6; font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif;'>
                    <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #f3f4f6; padding: 40px 0;'>
                        <tr>
                            <td align='center'>
                                <table width='600' border='0' cellspacing='0' cellpadding='0' style='background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                                    <tr>
                                        <td align='center' style='background-color: #4E61F6; padding: 40px 0;'>
                                            <h1 style='color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;'>MEDISURE</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 40px;'>
                                            <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                                                <tr>
                                                    <td align='center'>
                                                        <div style='width: 60px; height: 60px; background-color: #d1fae5; border-radius: 50%; display: inline-block; line-height: 60px; text-align: center; margin-bottom: 20px;'>
                                                            <span style='font-size: 30px; color: #059669;'>✓</span>
                                                        </div>
                                                        <h2 style='color: #1f2937; margin: 0 0 10px 0; font-size: 24px;'>Dziękujemy za zamówienie!</h2>
                                                        <p style='color: #6b7280; margin: 0 0 30px 0; font-size: 16px;'>Cześć {user.FirstName}, Twoja polisa jest już aktywna.</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style='background-color: #f9fafb; border-radius: 12px; padding: 25px;'>
                                                        <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                                                            <tr>
                                                                <td style='padding-bottom: 15px; color: #6b7280; font-size: 14px;'>Nr transakcji</td>
                                                                <td align='right' style='padding-bottom: 15px; color: #1f2937; font-weight: bold; font-size: 14px;'>{dto.TransactionId}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding-bottom: 15px; color: #6b7280; font-size: 14px;'>Data zakupu</td>
                                                                <td align='right' style='padding-bottom: 15px; color: #1f2937; font-weight: bold; font-size: 14px;'>{DateTime.Now.ToShortDateString()}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding-bottom: 15px; color: #6b7280; font-size: 14px;'>Metoda płatności</td>
                                                                <td align='right' style='padding-bottom: 15px; color: #1f2937; font-weight: bold; font-size: 14px;'>{dto.PaymentMethod.ToUpper()}</td>
                                                            </tr>
                                                            <tr>
                                                                <td colspan='2' style='border-bottom: 2px dashed #e5e7eb; padding-bottom: 15px; margin-bottom: 15px;'></td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding-bottom: 10px; color: #1f2937; font-size: 16px; font-weight: 600;'>Pakiet {package.Name}</td>
                                                                <td align='right' style='padding-bottom: 10px; color: #1f2937; font-size: 16px; font-weight: 600;'>{priceString} zł</td>
                                                            </tr>
                                                            <tr>
                                                                <td style='color: #6b7280; font-size: 12px;'>Okres: {effectiveStartDate.ToShortDateString()} - {effectiveEndDate.ToShortDateString()}</td>
                                                                <td align='right'></td>
                                                            </tr>
                                                            <tr><td colspan='2' style='padding-top: 20px;'></td></tr>
                                                            <tr>
                                                                <td style='padding-top: 20px; border-top: 1px solid #e5e7eb; color: #1f2937; font-size: 18px; font-weight: bold;'>RAZEM</td>
                                                                <td align='right' style='padding-top: 20px; border-top: 1px solid #e5e7eb; color: #4E61F6; font-size: 24px; font-weight: bold;'>{priceString} zł</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style='padding-top: 40px;'>
                                                        <h3 style='color: #1f2937; font-size: 16px; margin-bottom: 15px; border-left: 4px solid #4E61F6; padding-left: 10px;'>Dane nabywcy</h3>
                                                        <p style='color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;'>
                                                            <strong>{user.FirstName} {user.LastName}</strong><br>
                                                            PESEL: {dto.Pesel}<br>
                                                            ul. {dto.Street} {dto.HouseNumber}<br>
                                                            {dto.ZipCode} {dto.City}
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align='center' style='background-color: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb;'>
                                            <p style='color: #9ca3af; font-size: 12px; margin: 0;'>
                                                © {DateTime.Now.Year} Medisure Polska Sp. z o.o.<br>
                                                E-mail wygenerowany automatycznie. Prosimy na niego nie odpowiadać.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style='text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;'>
                                    <a href='{termsLink}' style='color: #9ca3af; text-decoration: underline;'>Regulamin Serwisu</a> | 
                                    <a href='{privacyLink}' style='color: #9ca3af; text-decoration: underline;'>Polityka Prywatności</a>
                                </p>

                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            ";

                await _emailService.SendEmailAsync(
                    user.Email,
                    $"Umowa Medisure - {package.Name}",
                    emailBody,
                    pdfBytes,
                    $"Polisa_{subscription.TransactionId}.pdf"
                );
                await _logService.LogAsync("EMAIL_SENT", $"Wysłano potwierdzenie zakupu na: {user.Email}", "System",
                    user.Id, "Success");
                await _notificationService.CreateNotificationAsync(
                    user.Id,
                    "Zakupiono pakiet",
                    $"Twój pakiet {package.Name} został aktywowany. Dziękujemy za zaufanie!",
                    "Purchase"
                );

                _ = _notificationService.NotifyAllAdminsAsync(
                    "Nowa sprzedaż",
                    $"Użytkownik {user.Email} zakupił pakiet {package.Name} ({dto.Duration}).",
                    "Sales"
                );
            }
            catch (Exception ex)
            {
                await _logService.LogAsync("EMAIL_FAILED", $"Błąd wysyłki po zakupie: {ex.Message}", "System", null,
                    "Error");
            }

            return Ok(new
            {
                Message = $"Sukces! Zakupiłeś pakiet: {package.Name}. Sprawdź maila.",
                User = new
                {
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.PhoneNumber,
                    user.BirthDate,
                    user.Pesel,
                    user.TwoFactorEnabled
                }
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetMySubscriptions()
        {
            var userIdOrEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdOrEmail == null) return Unauthorized();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userIdOrEmail || u.Email == userIdOrEmail);

            if (user == null) return BadRequest(new { Message = "Nie znaleziono użytkownika." });


            var myPackages = await _context.UserPackages
                .Where(up => up.UserId == user.Id)
                .Include(up => up.Package)
                .Select(up => new
                {
                    Id = up.Id,
                    PackageId = up.PackageId,
                    PackageName = up.Package.Name,
                    Price = up.PriceAtPurchase,
                    StartDate = up.StartDate,
                    EndDate = up.EndDate,
                    Status = up.Status,
                    Features = up.Package.Features,
                    TransactionId = up.TransactionId,
                    PaymentMethod = up.PaymentMethod,
                    Street = up.Street,
                    HouseNumber = up.HouseNumber,
                    City = up.City,
                    ZipCode = up.ZipCode,
                    IsMonthly = up.PriceAtPurchase.Contains("/mies")
                })
                .ToListAsync();

            return Ok(myPackages);
        }

        [HttpPost("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelSubscription(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var subscription = await _context.UserPackages
                .Include(up => up.Package)
                .FirstOrDefaultAsync(up => up.Id == id && up.UserId == userId);

            if (subscription == null)
                return NotFound(new { Message = "Nie znaleziono takiej subskrypcji." });


            if (subscription.Status == "Cancelled")
                return BadRequest(new { Message = "Ta subskrypcja została już anulowana." });


            if (subscription.EndDate < DateTime.UtcNow)
                return BadRequest(new { Message = "Nie można anulować wygasłej subskrypcji." });

            subscription.Status = "Cancelled";

            await _context.SaveChangesAsync();

            await _logService.LogAsync(
                "SUBSCRIPTION_CANCELLED",
                $"Użytkownik anulował subskrypcję {subscription.Package.Name} (ID: {subscription.Id}).",
                User.Identity?.Name,
                userId,
                "Info"
            );

            await _notificationService.CreateNotificationAsync(
                userId,
                "Subskrypcja anulowana",
                $"Anulowałeś odnawianie pakietu {subscription.Package.Name}. Dostęp zachowasz do {subscription.EndDate:dd.MM.yyyy}.",
                "System"
            );

            return Ok(new { Message = "Subskrypcja została pomyślnie anulowana." });
        }
    }
}