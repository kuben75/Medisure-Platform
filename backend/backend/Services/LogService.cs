using backend.Data;
using backend.Models;
using backend.Services.Interfaces;

namespace backend.Services;

public class LogService : ILogService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<LogService> _logger; 

    public LogService(ApplicationDbContext context, ILogger<LogService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task LogAsync(string action, string description, string userName, string userId = null,
        string level = "Info", bool isSensitive = false)
    {
        try
        {
            var log = new SystemLog
            {
                Action = action,
                Description = description,
                UserName = !string.IsNullOrEmpty(userName) ? userName : "System",
                UserId = userId,
                Level = level,
                CreatedAt = DateTime.UtcNow, 
                IsSensitive = isSensitive
            };

            _context.SystemLogs.Add(log);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError($"[CRITICAL] Nie udało się zapisać logu do bazy! Akcja: {action}. Błąd: {ex.Message}");
        }
    }
}