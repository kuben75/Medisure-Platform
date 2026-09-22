using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Workers;

public class DemoDataCleanupWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DemoDataCleanupWorker> _logger;

    public DemoDataCleanupWorker(IServiceProvider serviceProvider, ILogger<DemoDataCleanupWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Worker czyszczący bazę demo uruchomiony.");

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromHours(12), stoppingToken);

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

                _logger.LogInformation("Rozpoczynam resetowanie bazy danych demo...");

                await dbContext.ChatMessages.ExecuteDeleteAsync(stoppingToken);
                await dbContext.SystemLogs.ExecuteDeleteAsync(stoppingToken);
                await dbContext.SystemNotifications.ExecuteDeleteAsync(stoppingToken);
                await dbContext.UserPackages.ExecuteDeleteAsync(stoppingToken);
                await dbContext.Favorites.ExecuteDeleteAsync(stoppingToken);

                var adminEmail = config["SuperAdmin:Email"] ?? "root@medisure.pl";
                var seedEmails = DbInitializer.GetUsersToCreate().Select(u => u.Email).ToList();
                seedEmails.Add(adminEmail);

                var usersToDelete = await dbContext.Users
                    .Where(u => !seedEmails.Contains(u.Email))
                    .ToListAsync(stoppingToken);

                if (usersToDelete.Any())
                {
                    var userIdsToDelete = usersToDelete.Select(u => u.Id).ToList();

                    await dbContext.Reviews
                        .Where(r => userIdsToDelete.Contains(r.UserId))
                        .ExecuteDeleteAsync(stoppingToken);

                    dbContext.Users.RemoveRange(usersToDelete);
                    await dbContext.SaveChangesAsync(stoppingToken);
                }

                var packages = await dbContext.Packages.ToListAsync(stoppingToken);
                foreach (var pkg in packages)
                {
                    var pkgReviews = await dbContext.Reviews.Where(r => r.PackageId == pkg.Id).ToListAsync(stoppingToken);
                    pkg.Reviews = pkgReviews.Count;
                    pkg.AverageRating = pkgReviews.Any() ? pkgReviews.Average(r => r.Rating) : 0;
                }
                await dbContext.SaveChangesAsync(stoppingToken);

                _logger.LogInformation("Baza danych demo została pomyślnie zresetowana do stanu początkowego.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Wystąpił błąd podczas resetowania bazy danych demo.");
            }
        }
    }
}