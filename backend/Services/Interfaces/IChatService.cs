using backend.DTOs;
namespace backend.Services.Interfaces;
public interface IChatService
{
    Task MarkMessagesAsReadAsync(string receiverId);
    Task MarkUserMessagesAsReadByAdminAsync(string userEmail);
    Task<ChatHistoryDto> GetChatHistoryAsync(string userId, bool isAdmin);
}