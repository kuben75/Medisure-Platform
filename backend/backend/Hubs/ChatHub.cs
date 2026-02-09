using backend.Data;
using backend.Models;
using backend.Services.Interfaces;
using backend.Helpers; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Hubs;

[AllowAnonymous]
public class ChatHub : Hub
{
    private readonly ApplicationDbContext _context;
    private readonly UserConnectionManager _connections;
    private readonly IEmailService _emailService;
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ChatHub> _logger; 

    public ChatHub(
        ApplicationDbContext context, 
        UserConnectionManager connections, 
        IEmailService emailService,
        IMemoryCache cache, 
        IConfiguration configuration,
        ILogger<ChatHub> logger)
    {
        _context = context;
        _connections = connections;
        _emailService = emailService;
        _cache = cache;
        _configuration = configuration;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                Context.Abort();
                return;
            }

            _connections.KeepUserConnection(userId, Context.ConnectionId);
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);

            if (IsAdmin())
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "AdminsGroup");
            }
            else
            {
                await CheckAndSendWelcomeMessage(userId);
                await Clients.Group("AdminsGroup").SendAsync("UserStatusChanged", userId, true);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[ChatHub] OnConnectedAsync failed");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var offlineUserId = _connections.RemoveUserConnection(Context.ConnectionId);

            if (!string.IsNullOrEmpty(offlineUserId))
            {
                await Clients.Group("AdminsGroup").SendAsync("UserStatusChanged", offlineUserId, false);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[ChatHub] OnDisconnectedAsync failed");
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessageToAdmin(string message)
    {
        try
        {
            var userIdentifier = GetUserId();
            if (userIdentifier == null) return;

            await SaveMessageAsync(userIdentifier, "Admin", userIdentifier, message);

            await Clients.Group("AdminsGroup")
                .SendAsync("ReceiveMessage", userIdentifier, message, "UserToAdmin", null);
            
            await Clients.Group(userIdentifier)
                .SendAsync("ReceiveMessage", userIdentifier, message, "UserToAdmin", null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[ChatHub] SendMessageToAdmin failed");
        }
    }

    [Authorize(Roles = "Admin")]
    public async Task SendMessageToUser(string targetUserEmail, string message)
    {
        targetUserEmail = targetUserEmail.ToLower();
        try
        {
            await SaveMessageAsync("Admin", targetUserEmail, targetUserEmail, message);

            await Clients.Group(targetUserEmail)
                .SendAsync("ReceiveMessage", "Admin", message, "AdminToUser", targetUserEmail);
            
            await Clients.Group("AdminsGroup")
                .SendAsync("ReceiveMessage", "Admin", message, "AdminToUser", targetUserEmail);

            await TrySendEmailNotification(targetUserEmail, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[ChatHub] SendMessageToUser failed");
        }
    }


    private bool IsAdmin()
    {
        return Context.User?.Identity?.IsAuthenticated == true && Context.User.IsInRole("Admin");
    }

    private string GetUserId()
    {
        var email = Context.User?.FindFirst(ClaimTypes.Name)?.Value
                    ?? Context.User?.FindFirst(ClaimTypes.Email)?.Value;

        if (!string.IsNullOrEmpty(email)) return email.ToLower();

        var httpContext = Context.GetHttpContext();
        var anonId = httpContext?.Request.Query["anonId"].ToString();

        return !string.IsNullOrEmpty(anonId) ? anonId.ToLower() : null;
    }

    private async Task SaveMessageAsync(string sender, string receiver, string ownerId, string text)
    {
        try
        {
            string? dbUserId = ownerId;
            if (ownerId.StartsWith("guest_"))
            {
                dbUserId = null; 
            }

            var chatMsg = new ChatMessage
            {
                Sender = sender,
                Receiver = receiver,
                UserId = dbUserId, 
                Message = text,
                Timestamp = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                IsRead = false
            };
            
            
            _context.ChatMessages.Add(chatMsg);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"[ChatHub] Database save failed for user {ownerId}. Chat continues without history.");
        }
    }

    private async Task TrySendEmailNotification(string targetUserEmail, string message)
    {
        if (targetUserEmail.StartsWith("guest_")) return;

        string cacheKey = $"email_cooldown_{targetUserEmail}";
        if (_cache.TryGetValue(cacheKey, out _)) return;

        try
        {
            var frontendUrl = _configuration["FrontendUrl"];
            var chatLink = $"{frontendUrl}/profile?tab=chat";
            var subject = "Nowa wiadomość od konsultanta Medisure";
            
            var body = EmailTemplates.GetChatMessageNotification(message, chatLink);

            await _emailService.SendEmailAsync(targetUserEmail, subject, body);

            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(15));
            _cache.Set(cacheKey, true, cacheOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[ChatHub] Email notification failed");
        }
    }

    private async Task CheckAndSendWelcomeMessage(string userEmail)
    {

        bool hasHistory = false;
        
        if (!userEmail.StartsWith("guest_"))
        {
            hasHistory = await _context.ChatMessages.AnyAsync(m => m.UserId == userEmail);
        }

        if (!hasHistory)
        {
            var welcomeText = "Dzień dobry! Witamy w Medisure. W czym możemy Ci dzisiaj pomóc?";

            await SaveMessageAsync("System", userEmail, userEmail, welcomeText);
            
            await Clients.Group(userEmail).SendAsync("ReceiveMessage", "System", welcomeText, "AdminToUser", userEmail);
        }
    }
}