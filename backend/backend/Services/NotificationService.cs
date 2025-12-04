using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Identity;

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
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.SystemNotifications.Add(notification);
        await _context.SaveChangesAsync();
    }

    public async Task NotifyAllAdminsAsync(string title, string message, string type = "System")
    {
        var admins = await _userManager.GetUsersInRoleAsync("Admin");

        foreach (var admin in admins)
        {
            await CreateNotificationAsync(admin.Id, title, message, type);
        }
    }
}