using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Services.Interfaces;

namespace backend.Services;


public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public NotificationService(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task CreateNotificationAsync(string userId, string title, string message, string type = "System")
    {
        var notification = new SystemNotification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
            IsRead = false
        };

        _context.SystemNotifications.Add(notification);
        await _context.SaveChangesAsync();
    }

    public async Task NotifyAllAdminsAsync(string title, string message, string type = "System")
    {
        var admins = await _userManager.GetUsersInRoleAsync("Admin");
        if (!admins.Any()) return;

        var notifications = admins.Select(admin => new SystemNotification
        {
            UserId = admin.Id,
            Title = title,
            Message = message,
            Type = type,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        });

        await _context.SystemNotifications.AddRangeAsync(notifications);
        await _context.SaveChangesAsync();
    }

    public async Task BroadcastToAllUsersAsync(string title, string message, string type = "System")
    {
        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
        
        await _context.Database.ExecuteSqlRawAsync(
            "INSERT INTO \"SystemNotifications\" (\"UserId\", \"Title\", \"Message\", \"Type\", \"CreatedAt\", \"IsRead\") " +
            "SELECT \"Id\", {0}, {1}, {2}, {3}, false FROM \"AspNetUsers\"",
            title, message, type, now);
    }


    public async Task<IEnumerable<SystemNotification>> GetUserNotificationsAsync(string userId)
    {
        return await _context.SystemNotifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50) 
            .ToListAsync();
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _context.SystemNotifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
        
        if (notification == null) 
            return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task MarkAllAsReadAsync(string userId)
    {

        await _context.SystemNotifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        
    }

    public async Task<bool> DeleteNotificationAsync(int notificationId, string userId)
    {
        var affectedRows = await _context.SystemNotifications
            .Where(n => n.Id == notificationId && n.UserId == userId)
            .ExecuteDeleteAsync();

        return affectedRows > 0;
    }
}