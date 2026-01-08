using backend.Data;
using backend.Helpers; 
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Workers; 

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
            _logger.LogInformation("Worker: Sprawdzanie wygasających subskrypcji...");

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                    var threshold = DateTime.UtcNow.AddDays(7).Date;
                    var today = DateTime.UtcNow.Date;
                
                    var expiringSubs = await context.UserPackages
                        .Include(u => u.User)
                        .Include(p => p.Package)
                        .Where(s => s.Status == "Active" && !s.ExpirationWarningSent && s.EndDate.Date <= threshold && s.EndDate.Date >= today)         
                        .ToListAsync(stoppingToken);

                    foreach (var sub in expiringSubs)
                    {
                        var actionLink = $"{_configuration["FrontendUrl"]}/login";
                        
                        var body = EmailTemplates.GetSubscriptionExpiring(
                            sub.User.FirstName, sub.Package.Name, sub.EndDate.ToString("dd.MM.yyyy"), actionLink
                        );

                        try 
                        {
                            await emailService.SendEmailAsync(sub.User.Email, "Twoja subskrypcja wkrótce wygasa", body);
                            await notificationService.CreateNotificationAsync(sub.UserId, "Subskrypcja wygasa", $"Pakiet {sub.Package.Name} wygasa za 7 dni.", "System");
                            
                            sub.ExpirationWarningSent = true;
                        }
                        catch(Exception ex)
                        {
                            _logger.LogError($"Błąd wysyłki do {sub.User.Email}: {ex.Message}");
                        }
                    }

                    if (expiringSubs.Any()) await context.SaveChangesAsync(stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd workera.");
            }
            
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken); 
        }
    }
}