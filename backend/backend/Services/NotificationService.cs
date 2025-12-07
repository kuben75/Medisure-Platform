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

        var notifications = new List<SystemNotification>();
        foreach (var uid in userIds)
        {
            notifications.Add(new SystemNotification
            {
                UserId = uid,
                Title = title,
                Message = message,
                Type = type,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            });
        }

        await _context.SystemNotifications.AddRangeAsync(notifications);
        await _context.SaveChangesAsync();
    }
}