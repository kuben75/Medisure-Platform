using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface INotificationService
{
    Task CreateNotificationAsync(string userId, string title, string message, string type = "System");
    Task NotifyAllAdminsAsync(string title, string message, string type = "System");
    Task BroadcastToAllUsersAsync(string title, string message, string type = "System");

    Task<IEnumerable<SystemNotification>> GetUserNotificationsAsync(string userId);
    Task<bool> MarkAsReadAsync(int notificationId, string userId);
    Task MarkAllAsReadAsync(string userId);
    Task<bool> DeleteNotificationAsync(int notificationId, string userId);
}

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
            CreatedAt = DateTime.UtcNow,
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
      
        var userIds = await _context.Users.Select(u => u.Id).ToListAsync();

        var notifications = userIds.Select(uid => new SystemNotification
        {
            UserId = uid,
            Title = title,
            Message = message,
            Type = type,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        });

        await _context.SystemNotifications.AddRangeAsync(notifications);
        await _context.SaveChangesAsync();
    }


    public async Task<IEnumerable<SystemNotification>> GetUserNotificationsAsync(string userId)
    {
        return await _context.SystemNotifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _context.SystemNotifications.FindAsync(notificationId);

        if (notification == null || notification.UserId != userId) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        var unread = await _context.SystemNotifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        if (unread.Any())
        {
            foreach (var n in unread) n.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> DeleteNotificationAsync(int notificationId, string userId)
    {
        var notification = await _context.SystemNotifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        _context.SystemNotifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }
}