using backend.Models;
namespace backend.DTOs;

public class ChatHistoryDto
{
    public IEnumerable<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    public Dictionary<string, ChatUserDto> Users { get; set; } = new();
    public IEnumerable<string> OnlineUsers { get; set; } = new List<string>();
}