using backend.Models;
namespace backend.Services.Interfaces;

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