using backend.Data;
using backend.Models;

namespace backend.Services;
public interface ILogService
{
    Task LogAsync(string action, string description, string userName, string userId = null, string level = "Info", bool isSensitive = false);
}

public class LogService : ILogService
{
    private readonly ApplicationDbContext _context;

    public LogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string action, string description, string userName, string userId = null,
        string level = "Info", bool isSensitive = false)
    {
        var log = new SystemLog
        {
            Action = action,
            Description = description,
            UserName = userName ?? "System",
            UserId = userId,
            Level = level,
            CreatedAt = DateTime.UtcNow,
            IsSensitive = isSensitive
        };

        _context.SystemLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
