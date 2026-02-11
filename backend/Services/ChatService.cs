using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.Services.Interfaces;
using backend.DTOs;
using backend.Hubs;
namespace backend.Services;

public class ChatService : IChatService
{
    private readonly ApplicationDbContext _context;
    private readonly UserConnectionManager _connectionManager;

    private const string AdminRole = "Admin";
    private const string SystemRole = "System";

    public ChatService(ApplicationDbContext context, UserConnectionManager connectionManager)
    {
        _context = context;
        _connectionManager = connectionManager;
    }

    public async Task MarkMessagesAsReadAsync(string receiverId)
    {
        var unreadMsgs = await _context.ChatMessages
            .Where(m => m.Receiver == receiverId && !m.IsRead)
            .ToListAsync();

        if (unreadMsgs.Any())
        {
            foreach (var msg in unreadMsgs) {
                msg.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkUserMessagesAsReadByAdminAsync(string userEmailOrGuid)
    {
        var unreadMsgs = await _context.ChatMessages
            .Where(m => m.UserId == userEmailOrGuid && m.Sender != AdminRole && !m.IsRead)
            .ToListAsync();

        if (unreadMsgs.Any())
        {
            foreach (var msg in unreadMsgs) msg.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<ChatHistoryDto> GetChatHistoryAsync(string userId, bool isAdmin)
    {
        userId = userId.ToLower();

        if (!isAdmin)
        {
            var userMessages = await _context.ChatMessages
                .AsNoTracking()
                .Where(m => m.UserId == userId || m.Sender == userId || m.Receiver == userId)
                .OrderBy(m => m.Timestamp)
                .ToListAsync();

            return new ChatHistoryDto
            {
                Messages = userMessages,
                Users = new Dictionary<string, ChatUserDto>(), 
                OnlineUsers = new List<string>()
            };
        }
        
        
        var messages = await _context.ChatMessages
            .AsNoTracking()
            .OrderBy(m => m.Timestamp)
            .ToListAsync();
        
        var uniqueInteractors = new HashSet<string>();
        foreach (var msg in messages)
        {
            if (msg.Sender != AdminRole && msg.Sender != SystemRole) uniqueInteractors.Add(msg.Sender);
            if (msg.Receiver != AdminRole && msg.Receiver != SystemRole) uniqueInteractors.Add(msg.Receiver);
            if (!string.IsNullOrEmpty(msg.UserId)) uniqueInteractors.Add(msg.UserId);
        }
        
        var userList = uniqueInteractors.ToList();
        
        var registeredUsers = await _context.Users
            .AsNoTracking()
            .Where(u => userList.Contains(u.Email!) || userList.Contains(u.Id))
            .ToListAsync();
        
        var usersMap = new Dictionary<string, ChatUserDto>();
        foreach (var u in registeredUsers)
        {
            if (!string.IsNullOrEmpty(u.Email))
            {
                usersMap[u.Email.ToLower()] = new ChatUserDto 
                { 
                    FirstName = u.FirstName, 
                    LastName = u.LastName,
                    Email = u.Email
                };
            }
        }

        var finalUsersList = new Dictionary<string, ChatUserDto>();

        foreach (var id in uniqueInteractors)
        {
            if (string.IsNullOrEmpty(id)) continue; 

            var lowerId = id.ToLower();

            if (usersMap.TryGetValue(lowerId, out var userDto))
            {
                finalUsersList[lowerId] = userDto;
            }
            else
            {
                string displayName = "Gość";
                string displayLast = "";

                if (id.StartsWith("guest_"))
                {
                    displayLast = $"({id.Substring(6)})"; 
                }
                else 
                {
                    displayLast = id.Length > 5 ? $"...{id.Substring(0, 5)}" : id;
                }

                finalUsersList[lowerId] = new ChatUserDto 
                { 
                    FirstName = displayName, 
                    LastName = displayLast,
                    Email = id 
                };
            }
        }

        return new ChatHistoryDto
        {
            Messages = messages,
            Users = finalUsersList,
            OnlineUsers = _connectionManager.GetOnlineUsers()
        };
    }
}