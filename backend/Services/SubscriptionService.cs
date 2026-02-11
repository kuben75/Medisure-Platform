using backend.Data;
using backend.DTOs;
using backend.Helpers;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogService _logService;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly IPdfService _pdfService;
    private readonly IPricingService _pricingService;
    private readonly IConfiguration _configuration;

    public SubscriptionService(ApplicationDbContext context, ILogService logService, IEmailService emailService,
        INotificationService notificationService, IPdfService pdfService, IPricingService pricingService, IConfiguration configuration)
    {
        _context = context;
        _logService = logService;
        _emailService = emailService;
        _notificationService = notificationService;
        _pdfService = pdfService;
        _pricingService = pricingService;
        _configuration = configuration;
    }

    public async Task<(bool Success, string Message, object? Data)> SubscribeAsync(int packageId, SubscribeDto dto, string userId, string userEmail)
{
    var user = await _context.Users.FindAsync(userId);
    if (user == null) return (false, "Nie znaleziono użytkownika.", null);
    
    if (!string.IsNullOrEmpty(user.Pesel))
    {
        if (user.Pesel != dto.Pesel) return (false, "Podany PESEL różni się od przypisanego do konta.", null);
    }
    else
    {
        if (await _context.Users.AnyAsync(u => u.Pesel == dto.Pesel && u.Id != userId))
            return (false, "PESEL jest już zajęty przez innego użytkownika.", null);
        
        user.Pesel = dto.Pesel;
    }
    
    if (user.BirthDate == null && dto.BirthDate.HasValue)
        user.BirthDate = DateTime.SpecifyKind(dto.BirthDate.Value, DateTimeKind.Utc);
    
    

    var package = await _context.Packages.FindAsync(packageId);
    if (package == null) return (false, "Pakiet nie istnieje.", null);

    if (package.Category == "Biznesowy")
    {
        await _logService.LogAsync("NIEAUTORYZOWANY_ZAKUP", $"Próba zakupu B2B: {package.Name}", "System", userId, "Warning", true);
        return (false, "Pakiety biznesowe dostępne tylko przez kontakt.", null);
    }
    

    DateTime? targetBirthDate = user.BirthDate ?? dto.BirthDate;

    if (targetBirthDate == null)
        return (false, "Data urodzenia jest wymagana do wyliczenia składki.", null);
    

    var today = DateTime.UtcNow;
    var age = today.Year - targetBirthDate.Value.Year;
    if (targetBirthDate.Value.Date > today.AddYears(-age)) age--;

    if (age < 18) return (false, "Musisz mieć ukończone 18 lat, aby zawrzeć umowę.", null);
    if (age > 99) return (false, "Przepraszamy, oferta nie obejmuje osób powyżej 99 roku życia.", null);

    
    var basePrice = _pricingService.CalculateBasePriceWithRiskFactor(package.PriceValue, package.Category, targetBirthDate.Value);
    var finalPrice = _pricingService.CalculateFinalPrice(basePrice, dto.Duration, dto.BillingPeriod);
    
    var startDate = dto.StartDate.HasValue && dto.StartDate > DateTime.UtcNow ? dto.StartDate.Value.ToUniversalTime() : DateTime.UtcNow;
    DateTime endDate;
    string priceString;
    
    if (dto.Duration == "7d")
    {
        endDate = startDate.AddDays(6);
        priceString = $"{finalPrice:F2} zł (Test)";
    }
    else
    {
        int months = dto.Duration == "24m" ? 24 : 12;
        endDate = startDate.AddMonths(months).AddDays(-1);
        priceString = $"{finalPrice:F2} zł" + (dto.BillingPeriod == "monthly" ? " / mies" : "");
    }
    endDate = endDate.Date.AddHours(23).AddMinutes(59).AddSeconds(59);

    var subscription = new UserPackage
    {
        UserId = userId,
        PackageId = packageId,
        StartDate = startDate,
        EndDate = endDate,
        Status = "Active",
        PriceAtPurchase = priceString,
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

    await HandlePostPurchaseActions(user, package, subscription, dto, priceString, startDate, endDate);

    return (true, $"Sukces! Zakupiłeś pakiet: {package.Name}.", new 
    { 
        user.Email, 
        user.FirstName, 
        user.LastName, 
        user.Pesel, 
        user.PhoneNumber,
        user.BirthDate 
    });
}

    private async Task HandlePostPurchaseActions(ApplicationUser user, Package package, UserPackage sub, SubscribeDto dto, string priceString, DateTime start, DateTime end)
    {
        await _logService.LogAsync("ZAKUP_SUKCES", $"Zakup: {package.Name}, ID: {sub.Id}", user.Email!, user.Id, "Success");
        
        try
        {
            var pdfBytes = _pdfService.GenerateCertificate(sub, user);
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173"; 
            var emailBody = EmailTemplates.GetPurchaseConfirmation(
                user.FirstName, dto.TransactionId, dto.PaymentMethod, package.Name, priceString, 
                start.ToShortDateString(), end.ToShortDateString(), dto.Pesel, dto.Street, dto.HouseNumber, dto.ZipCode, dto.City, 
                $"{frontendUrl}/regulamin", $"{frontendUrl}/polityka-prywatnosci"
            );

            await _emailService.SendEmailAsync(user.Email!, $"Umowa Medisure - {package.Name}", emailBody, pdfBytes, $"Polisa_{sub.TransactionId}.pdf");
            
            await _notificationService.CreateNotificationAsync(user.Id, "Zakupiono pakiet", $"Twój pakiet {package.Name} aktywny.", "Zakup");
            
            await _notificationService.NotifyAllAdminsAsync("Nowa sprzedaż", $"Użytkownik {user.Email} kupił {package.Name}.", "Sales");
        }
        catch (Exception ex)
        {
            await _logService.LogAsync("EMAIL_BLAD", $"Błąd po zakupie (Mail/PDF): {ex.Message}", "System", null, "Error");
        }
    }

    public async Task<IEnumerable<object>> GetUserSubscriptionsAsync(string userId)
    {
        return await _context.UserPackages
            .Where(up => up.UserId == userId)
            .Include(up => up.Package)
            .Select(up => new
            {
                up.Id,
                up.PackageId,
                PackageName = up.Package.Name,
                Price = up.PriceAtPurchase,
                up.StartDate,
                up.EndDate,
                up.Status,
                up.Package.Features, 
                up.TransactionId,
                up.PaymentMethod,
                IsMonthly = up.PriceAtPurchase.Contains("/mies"),
                up.Street,
                up.HouseNumber,
                up.City,
                up.ZipCode,
                up.Pesel
            })
            .ToListAsync();
    }

    public async Task<(bool Success, string Message)> CancelSubscriptionAsync(int subscriptionId, string userId, string userName)
    {
        var subscription = await _context.UserPackages
            .Include(up => up.Package)
            .FirstOrDefaultAsync(up => up.Id == subscriptionId && up.UserId == userId);

        if (subscription == null) 
            return (false, "Nie znaleziono subskrypcji.");
        
        if (subscription.Status == "Cancelled") 
            return (false, "Subskrypcja jest już anulowana.");
        
        if (subscription.EndDate < DateTime.UtcNow) 
            return (false, "Subskrypcja już wygasła.");

        subscription.Status = "Cancelled";
        await _context.SaveChangesAsync();

        await _logService.LogAsync("ANULOWANIE", $"Anulowano {subscription.Package.Name}", userName, userId);
        await _notificationService.CreateNotificationAsync(userId, "Subskrypcja anulowana", $"Anulowano odnawianie pakietu {subscription.Package.Name}. Dostęp aktywny do końca okresu.");

        return (true, "Subskrypcja została anulowana.");
    }
}