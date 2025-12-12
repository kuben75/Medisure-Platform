using backend.Data;
using backend.Models;
using backend.Services;
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

    public ChatHub(ApplicationDbContext context, UserConnectionManager connections, IEmailService emailService,
        IMemoryCache cache, IConfiguration configuration)
    {
        _context = context;
        _connections = connections;
        _emailService = emailService;
        _cache = cache;
        _configuration = configuration;
    }

    private string GetUserId()
    {
        var email = Context.User?.FindFirst(ClaimTypes.Name)?.Value
                    ?? Context.User?.FindFirst(ClaimTypes.Email)?.Value;

        if (!string.IsNullOrEmpty(email)) return email.ToLower();

        var httpContext = Context.GetHttpContext();
        var anonId = httpContext?.Request.Query["anonId"].ToString();

        if (!string.IsNullOrEmpty(anonId)) return anonId.ToLower();

        return null;
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

            if (Context.User?.Identity?.IsAuthenticated == true && Context.User.IsInRole("Admin"))
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
            Console.WriteLine($"[ChatHub Error] OnConnectedAsync failed: {ex.Message}");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var offlineUserId = _connections.RemoveUserConnection(Context.ConnectionId);

            if (!string.IsNullOrEmpty(offlineUserId))
                await Clients.Group("AdminsGroup").SendAsync("UserStatusChanged", offlineUserId, false);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ChatHub Error] OnDisconnectedAsync failed: {ex.Message}");
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessageToAdmin(string message)
    {
        try
        {
            var userIdentifier = GetUserId();

            if (userIdentifier == null) return;
            try
            {
                var chatMsg = new ChatMessage
                {
                    Sender = userIdentifier,
                    Receiver = "Admin",
                    UserId = userIdentifier,
                    Message = message,
                    Timestamp = DateTime.UtcNow,
                    IsRead = false
                };
                _context.ChatMessages.Add(chatMsg);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ChatHub Error] Database save failed: {ex.Message}");
            }

            await Clients.Group("AdminsGroup")
                .SendAsync("ReceiveMessage", userIdentifier, message, "UserToAdmin", null);
            await Clients.Group(userIdentifier)
                .SendAsync("ReceiveMessage", userIdentifier, message, "UserToAdmin", null);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ChatHub Error] SendMessageToAdmin failed: {ex.Message}");
        }
    }

    [Authorize(Roles = "Admin")]
    public async Task SendMessageToUser(string targetUserEmail, string message)
    {
        targetUserEmail = targetUserEmail.ToLower();
        try
        {
            var chatMsg = new ChatMessage
            {
                Sender = "Admin",
                Receiver = targetUserEmail,
                UserId = targetUserEmail,
                Message = message,
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };
            _context.ChatMessages.Add(chatMsg);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ChatHub Error] Database save failed: {ex.Message}");
        }

        await Clients.Group(targetUserEmail)
            .SendAsync("ReceiveMessage", "Admin", message, "AdminToUser", targetUserEmail);
        await Clients.Group("AdminsGroup")
            .SendAsync("ReceiveMessage", "Admin", message, "AdminToUser", targetUserEmail);
        bool isGuest = targetUserEmail.StartsWith("guest_");

        if (!isGuest)
        {
            var frontendUrl = _configuration["FrontendUrl"];
            var chatLink = $"{frontendUrl}/profile?tab=chat";

            string cacheKey = $"email_cooldown_{targetUserEmail}";

            if (!_cache.TryGetValue(cacheKey, out _))
            {
                try
                {
                    var subject = "Nowa wiadomość od konsultanta Medisure";

                    var body = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <title>Nowa wiadomość</title>
            </head>
            <body style='margin: 0; padding: 0; background-color: #f3f4f6; font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif;'>
                <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #f3f4f6; padding: 40px 0;'>
                    <tr>
                        <td align='center'>
                            <table width='600' border='0' cellspacing='0' cellpadding='0' style='background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                                
                                <tr>
                                    <td align='center' style='padding: 30px 40px; border-bottom: 1px solid #f0f0f0;'>
                                        <h2 style='color: #4E61F6; margin: 0; font-size: 24px; letter-spacing: -0.5px;'>Medisure<span style='color: #1f2937;'>.pl</span></h2>
                                    </td>
                                </tr>

                                <tr>
                                    <td style='padding: 40px;'>
                                        <h3 style='color: #1f2937; margin: 0 0 15px 0; font-size: 20px;'>Dzień dobry! 👋</h3>
                                        <p style='color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 25px;'>
                                            Otrzymałeś nową wiadomość od naszego konsultanta na czacie.
                                        </p>

                                        <div style='background-color: #F8FAFC; border-left: 4px solid #4E61F6; border-radius: 4px; padding: 20px; margin-bottom: 30px;'>
                                            <p style='margin: 0; color: #374151; font-style: italic; font-size: 15px; line-height: 1.6;'>
                                                ""{message}""
                                            </p>
                                        </div>

                                        <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                                            <tr>
                                                <td align='center'>
                                                    <a href='{chatLink}' style='background-color: #4E61F6; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(78, 97, 246, 0.3);'>
                                                        Odpowiedz na czacie &rarr;
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td style='background-color: #f9fafb; padding: 20px 40px; text-align: center;'>
                                        <p style='color: #9ca3af; font-size: 12px; margin: 0 0 5px 0;'>
                                            Jeśli otrzymasz więcej wiadomości w krótkim czasie, wyślemy tylko to jedno powiadomienie (anty-spam).
                                        </p>
                                        <p style='color: #d1d5db; font-size: 12px; margin: 0;'>
                                            &copy; {DateTime.Now.Year} Medisure Polska Sp. z o.o.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>";

                    _ = _emailService.SendEmailAsync(targetUserEmail, subject, body);

                    var cacheOptions = new MemoryCacheEntryOptions()
                        .SetAbsoluteExpiration(TimeSpan.FromMinutes(15));

                    _cache.Set(cacheKey, true, cacheOptions);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Błąd wysyłki powiadomienia czatu: {ex.Message}");
                }
            }
        }
    }

    private async Task CheckAndSendWelcomeMessage(string userEmail)
    {
        bool hasHistory = await _context.ChatMessages.AnyAsync(m => m.UserId == userEmail);

        if (!hasHistory)
        {
            var welcomeText = "Dzień dobry! 👋 Witamy w Medisure. W czym możemy Ci dzisiaj pomóc?";
            try
            {
                var welcomeMsg = new ChatMessage
                {
                    Sender = "System",
                    Receiver = userEmail,
                    UserId = userEmail,
                    Message = welcomeText,
                    Timestamp = DateTime.UtcNow,
                    IsRead = true
                };

                _context.ChatMessages.Add(welcomeMsg);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ChatHub Error] Database save failed: {ex.Message}");
            }

            await Clients.Group(userEmail).SendAsync("ReceiveMessage", "System", welcomeText, "AdminToUser", userEmail);

            // await Clients.Group("AdminsGroup").SendAsync("ReceiveMessage", "System", welcomeText, "AdminToUser", userEmail);
        }
    }

    private string GetEmail()
    {
        var email = Context.User?.FindFirst(ClaimTypes.Name)?.Value
                    ?? Context.User?.FindFirst(ClaimTypes.Email)?.Value
                    ?? Context.UserIdentifier;
        return email?.ToLower();
    }
}