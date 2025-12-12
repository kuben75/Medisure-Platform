using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class SubscriptionExpirationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SubscriptionExpirationWorker> _logger;
    private readonly IConfiguration _configuration;

    public SubscriptionExpirationWorker(IServiceProvider serviceProvider, ILogger<SubscriptionExpirationWorker> logger, IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Sprawdzanie wygasających subskrypcji...");

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                    var targetDate = DateTime.UtcNow.AddDays(7).Date;
                    
                    var expiringSubscriptions = await context.UserPackages
                        .Include(u => u.User)
                        .Include(p => p.Package)
                        .Where(s => s.Status == "Active" 
                                    && !s.ExpirationWarningSent
                                    && s.EndDate.Date == targetDate)
                        .ToListAsync(stoppingToken);

                    foreach (var sub in expiringSubscriptions)
                    {
                        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
                        var actionLink = $"{frontendUrl}/login";
                        var subject = "Twoja subskrypcja wkrótce wygasa";
                        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Wygasająca subskrypcja</title>
</head>
<body style='margin: 0; padding: 0; background-color: #f3f4f6; font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif;'>
    <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #f3f4f6; padding: 40px 0;'>
        <tr>
            <td align='center'>
                <table width='600' border='0' cellspacing='0' cellpadding='0' style='background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                    
                    <tr>
                        <td align='center' style='background-color: #4E61F6; padding: 30px 0;'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;'>MEDISURE</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style='padding: 40px;'>
                            <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                                <tr>
                                    <td align='center'>
                                        <div style='width: 60px; height: 60px; background-color: #FFF7ED; border-radius: 50%; display: inline-block; line-height: 60px; text-align: center; margin-bottom: 20px;'>
                                            <span style='font-size: 30px;'>⏳</span>
                                        </div>
                                        
                                        <h2 style='color: #1f2937; margin: 0 0 15px 0; font-size: 22px;'>Twoja ochrona wkrótce wygasa</h2>
                                        
                                        <p style='color: #6b7280; margin: 0 0 25px 0; font-size: 16px; line-height: 1.5;'>
                                            Cześć <strong>{sub.User.FirstName}</strong>! <br>
                                            Zauważyliśmy, że Twój pakiet medyczny wkrótce straci ważność. Nie pozwól, aby Twoja ochrona wygasła.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style='background-color: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 12px; padding: 20px;'>
                                        <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                                            <tr>
                                                <td style='padding-bottom: 8px; color: #9A3412; font-size: 12px; font-weight: bold; text-transform: uppercase;'>Wygasający pakiet</td>
                                            </tr>
                                            <tr>
                                                <td style='color: #1f2937; font-size: 18px; font-weight: bold; padding-bottom: 5px;'>
                                                    {sub.Package.Name}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='color: #C2410C; font-size: 14px;'>
                                                    Wygasa dnia: <strong>{sub.EndDate:dd.MM.yyyy}</strong>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td align='center' style='padding-top: 30px;'>
                                        <a href='{actionLink}' style='background-color: #4E61F6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(78, 97, 246, 0.3);'>
                                            Zaloguj się i przedłuż &rarr;
                                        </a>
                                        <p style='margin-top: 20px; font-size: 13px; color: #9ca3af;'>
                                            Jeśli masz ustawione automatyczne odnawianie, możesz zignorować tę wiadomość.
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
                                Potrzebujesz pomocy? Odpisz na tę wiadomość.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

                        try 
                        {
                            await emailService.SendEmailAsync(sub.User.Email, subject, body);
                        }
                        catch(Exception ex)
                        {
                            _logger.LogError($"Błąd wysyłki maila do {sub.User.Email}: {ex.Message}");
                        }

                        await notificationService.CreateNotificationAsync(
                            sub.UserId, 
                            "Subskrypcja wygasa", 
                            $"Twój pakiet {sub.Package.Name} wygasa za 7 dni.", 
                            "System"
                        );

                        sub.ExpirationWarningSent = true;
                    }

                    if (expiringSubscriptions.Any())
                    {
                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation($"Wysłano powiadomienia do {expiringSubscriptions.Count} użytkowników.");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas sprawdzania subskrypcji.");
            }
            
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}