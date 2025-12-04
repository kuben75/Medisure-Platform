using System.Threading.Tasks;

namespace backend.Services;

public interface INotificationService
{ 
    Task CreateNotificationAsync(string userId, string title, string message, string type = "System"); 
    Task NotifyAllAdminsAsync(string title, string message, string type = "System");
}
