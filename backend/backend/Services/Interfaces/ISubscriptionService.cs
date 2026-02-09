using backend.DTOs;
namespace backend.Services.Interfaces;

public interface ISubscriptionService
{
    Task<(bool Success, string Message, object? Data)> SubscribeAsync(int packageId, SubscribeDto dto, string userId, string userEmail);
    Task<IEnumerable<object>> GetUserSubscriptionsAsync(string userId);
    Task<(bool Success, string Message)> CancelSubscriptionAsync(int subscriptionId, string userId, string userName);
}