using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IChatService
{
    Task MarkMessagesAsReadAsync(string receiverId);
    Task MarkUserMessagesAsReadByAdminAsync(string userEmail);
    Task<object> GetChatHistoryAsync(string userId, bool isAdmin);
}

public class ChatService : IChatService
{
    private readonly ApplicationDbContext _context;
    private readonly UserConnectionManager _connectionManager;

    public ChatService(ApplicationDbContext context, UserConnectionManager connectionManager)
    {
        _context = context;
        _connectionManager = connectionManager;
    }

    public async Task MarkMessagesAsReadAsync(string receiverId)
    {
        var unreadMsgs = await _context.ChatMessages
            .Where(m => m.Receiver.ToLower() == receiverId.ToLower() && !m.IsRead)
            .ToListAsync();

        if (unreadMsgs.Any())
        {
            foreach (var msg in unreadMsgs) msg.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkUserMessagesAsReadByAdminAsync(string userEmail)
    {
        var unreadMsgs = await _context.ChatMessages
            .Where(m => m.UserId == userEmail.ToLower() && m.Sender != "Admin" && !m.IsRead)
            .ToListAsync();

        if (unreadMsgs.Any())
        {
            foreach (var msg in unreadMsgs) msg.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<object> GetChatHistoryAsync(string userId, bool isAdmin)
    {
        userId = userId.ToLower();

        if (!isAdmin)
        {
            return await _context.ChatMessages
                .Where(m => m.UserId.ToLower() == userId)
                .OrderBy(m => m.Timestamp)
                .ToListAsync();
        }

        var messages = await _context.ChatMessages.OrderBy(m => m.Timestamp).ToListAsync();

        var userIds = messages
            .Where(m => m.UserId != "Admin" && m.UserId != "System")
            .Select(m => m.UserId)
            .Distinct()
            .ToList();

        var registeredUsers = await _context.Users
            .Where(u => userIds.Contains(u.Email))
            .ToDictionaryAsync(u => u.Email.ToLower(), u => new { u.FirstName, u.LastName });

        var allUsersDetails = new Dictionary<string, object>();

        foreach (var id in userIds)
        {
            if (registeredUsers.ContainsKey(id))
            {
                allUsersDetails[id] = registeredUsers[id];
            }
            else
            {
                var shortId = id.Length > 10 ? id.Substring(6, 5) : id;
                allUsersDetails[id] = new { FirstName = "Gość", LastName = $"({shortId})" };
            }
        }

        return new
        {
            Messages = messages,
            Users = allUsersDetails,
            OnlineUsers = _connectionManager.GetOnlineUsers()
        };
    }
}