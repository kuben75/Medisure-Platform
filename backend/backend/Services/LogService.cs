using backend.Data;
using backend.Models;

namespace backend.Services;
public interface ILogService
{
    Task LogAsync(string action, string description, string userName, string userId = null, string level = "Info");
}

public class LogService : ILogService
{
    private readonly ApplicationDbContext _context;

    public LogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string action, string description, string userName, string userId = null,
        string level = "Info")
    {
        var log = new SystemLog
        {
            Action = action,
            Description = description,
            UserName = userName ?? "System",
            UserId = userId ?? null,
            Level = level,
            CreatedAt = DateTime.UtcNow
        };

        _context.SystemLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
