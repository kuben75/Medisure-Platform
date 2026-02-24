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
            foreach (var msg in unreadMsgs) 
            {
                msg.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkUserMessagesAsReadByAdminAsync(string userEmailOrGuid)
    {
        
        bool isGuest = userEmailOrGuid.StartsWith("guest_");
        
        IQueryable<backend.Models.ChatMessage> query = _context.ChatMessages;

        if (isGuest)
        {
            query = query.Where(m => (m.Sender == userEmailOrGuid || m.Receiver == userEmailOrGuid) 
                                     && m.Sender != AdminRole 
                                     && !m.IsRead);
        }
        else
        {
            query = query.Where(m => m.UserId == userEmailOrGuid 
                                     && m.Sender != AdminRole 
                                     && !m.IsRead);
        }

        var unreadMsgs = await query.ToListAsync();

        if (unreadMsgs.Any())
        {
            foreach (var msg in unreadMsgs) msg.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<ChatHistoryDto> GetChatHistoryAsync(string userId, bool isAdmin)
    {
        userId = userId.ToLower();
        bool isGuest = userId.StartsWith("guest_");

        if (!isAdmin)
        {
            var query = _context.ChatMessages.AsNoTracking();

            if (isGuest)
            {
                query = query.Where(m => m.Sender == userId || m.Receiver == userId);
            }
            else
            {
                query = query.Where(m => m.UserId == userId || m.Sender == userId || m.Receiver == userId);
            }

            var userMessages = await query
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
            
            if (!string.IsNullOrEmpty(msg.UserId) && msg.UserId != "guest") 
            {
                uniqueInteractors.Add(msg.UserId);
            }
        }
        
        var realUserIds = uniqueInteractors
            .Where(id => !id.StartsWith("guest_"))
            .ToList();
        
        var registeredUsers = await _context.Users
            .AsNoTracking()
            .Where(u => realUserIds.Contains(u.Email!) || realUserIds.Contains(u.Id))
            .ToListAsync();
        
        var usersMap = new Dictionary<string, ChatUserDto>();
        foreach (var u in registeredUsers)
        {
            if (!string.IsNullOrEmpty(u.Email))
            {
                var dto = new ChatUserDto 
                { 
                    FirstName = u.FirstName, 
                    LastName = u.LastName,
                    Email = u.Email
                };
                usersMap[u.Email.ToLower()] = dto;
                usersMap[u.Id.ToLower()] = dto;
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
                    displayLast = id.Length > 6 ? $"({id.Substring(6)})" : "(-)"; 
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