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

        public SubscriptionsController(ApplicationDbContext context, ILogService logService, IEmailService emailService, INotificationService notificationService)
        {
            _context = context;
            _logService = logService;
            _emailService = emailService;
            _notificationService = notificationService;
        }

        [HttpPost("{packageId}")]
        public async Task<IActionResult> Subscribe(int packageId, [FromBody] SubscribeDto dto)
        {
            var userIdOrEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userIdOrEmail)) return Unauthorized(new { Message = "Brak identyfikatora w tokenie." });
            

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userIdOrEmail || u.Email == userIdOrEmail);

            if (user == null)
            {
                await _logService.LogAsync(
                    "SUBSCRIBE_PACKAGE_FAILED",
                    $"Nie znaleziono użytkownika dla identyfikatora: {userIdOrEmail}",
                    "System",
                    null,
                    "Error"
                );
                return BadRequest(new { Message = $"Nie znaleziono użytkownika dla identyfikatora: {userIdOrEmail}" });
            }
            if (string.IsNullOrEmpty(user.Pesel))
            {
                return BadRequest(new { 
                    Message = "Brak numeru PESEL. Uzupełnij dane w profilu, aby dokonać zakupu.",
                    Code = "MISSING_PESEL" 
                });
            }
            var package = await _context.Packages.FindAsync(packageId);
            if (package == null)
            {
                return NotFound(new { Message = "Taki pakiet nie istnieje." });
            }
            DateTime startDate = DateTime.UtcNow;
            DateTime endDate;
            decimal finalPrice = 0;

            switch (dto.Duration.ToLower())
            {
                case "7d": 
                    endDate = startDate.AddDays(7);
                    finalPrice = 0; 
                    break;

                case "2y": 
                    endDate = startDate.AddYears(2);
                    decimal baseTotal2Y = package.PriceValue * 24;
                    finalPrice = baseTotal2Y * 0.85m; 
                    break;

                case "1y":
                    endDate = startDate.AddYears(1);
                    finalPrice = package.PriceValue * 12;
                    break;
                default:
                    endDate = startDate.AddYears(1);
                    finalPrice = package.PriceValue * 12;
                    break;
            }
            finalPrice = Math.Round(finalPrice, 2);
            var subscription = new UserPackage
            {
                User = user,      
                PackageId = packageId,
                StartDate = startDate,
                EndDate = endDate,
                Status = "Active",
                PriceAtPurchase = $"{finalPrice} zł",
                Street = dto.Street,
                HouseNumber = dto.HouseNumber,
                City = dto.City,
                ZipCode = dto.ZipCode,
                PaymentMethod = dto.PaymentMethod,
                TransactionId = dto.TransactionId
                
            };

            _context.UserPackages.Add(subscription);
            await _context.SaveChangesAsync();
            
            await _logService.LogAsync("SUBSCRIBE_PACKAGE", $"Zakup: {package.Name}. TX: {dto.TransactionId}", user.Email, user.Id, "Success");

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
                                            <tr><td colspan='2' style='padding-top: 15px;'></td></tr>

                                            <tr>
                                                <td style='padding-bottom: 10px; color: #1f2937; font-size: 16px; font-weight: 600;'>Pakiet {package.Name}</td>
                                                <td align='right' style='padding-bottom: 10px; color: #1f2937; font-size: 16px; font-weight: 600;'>{finalPrice} zł</td>
                                            </tr>
                                            <tr>
                                                <td style='color: #6b7280; font-size: 12px;'>Okres: {startDate.ToShortDateString()} - {endDate.ToShortDateString()}</td>
                                                <td align='right'></td>
                                            </tr>
                                            
                                            <tr><td colspan='2' style='padding-top: 20px;'></td></tr>
                                            <tr>
                                                <td style='padding-top: 20px; border-top: 1px solid #e5e7eb; color: #1f2937; font-size: 18px; font-weight: bold;'>RAZEM</td>
                                                <td align='right' style='padding-top: 20px; border-top: 1px solid #e5e7eb; color: #4E61F6; font-size: 24px; font-weight: bold;'>{finalPrice} zł</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td style='padding-top: 40px;'>
                                        <h3 style='color: #1f2937; font-size: 16px; margin-bottom: 15px; border-left: 4px solid #4E61F6; padding-left: 10px;'>Dane nabywcy</h3>
                                        <p style='color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;'>
                                            <strong>{user.FirstName} {user.LastName}</strong><br>
                                            PESEL: {user.Pesel}<br>
                                            ul. {dto.Street} {dto.HouseNumber}<br>
                                            {dto.ZipCode} {dto.City}
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td align='center' style='padding-top: 40px;'>
                                        <a href='#' style='background-color: #4E61F6; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; display: inline-block;'>Pobierz Umowę (PDF)</a>
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
                    <a href='#' style='color: #9ca3af; text-decoration: underline;'>Regulamin</a> | 
                    <a href='#' style='color: #9ca3af; text-decoration: underline;'>Polityka Prywatności</a>
                </p>

            </td>
        </tr>
    </table>
</body>
</html>
";

            await _emailService.SendEmailAsync(user.Email, $"Umowa Medisure - {package.Name}", emailBody);
            await _notificationService.CreateNotificationAsync(
                user.Id, 
                "Zakupiono pakiet", 
                $"Twój pakiet {package.Name} został aktywowany. Dziękujemy za zaufanie!", 
                "Purchase"
            );
            await _notificationService.NotifyAllAdminsAsync(
                "Nowa sprzedaż", 
                $"Użytkownik {user.Email} zakupił pakiet {package.Name} ({dto.Duration}).", 
                "Sales"
            );
            return Ok(new { Message = $"Sukces! Zakupiłeś pakiet: {package.Name}, Sprawdź maila." });
        }

        [HttpGet]
        public async Task<IActionResult> GetMySubscriptions()
        {
            var userIdOrEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdOrEmail == null) return Unauthorized();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userIdOrEmail || u.Email == userIdOrEmail);

            if (user == null)
            {
                return BadRequest(new { Message = "Nie znaleziono użytkownika." });
            }

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
                    Features = up.Package.Features ,
                    TransactionId = up.TransactionId,
                    PaymentMethod = up.PaymentMethod,
                    Street = up.Street,
                    HouseNumber = up.HouseNumber, 
                    City = up.City,
                    ZipCode = up.ZipCode,
                })
                .ToListAsync();
    
            return Ok(myPackages);
        }
    }
}