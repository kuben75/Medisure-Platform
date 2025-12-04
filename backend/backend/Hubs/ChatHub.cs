using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace backend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;
        private readonly UserConnectionManager _connections;

        public ChatHub(ApplicationDbContext context, UserConnectionManager connections)
        {
            _context = context;
            _connections = connections;
        }

        public override async Task OnConnectedAsync()
        {
            var email = GetEmail();
            if (!string.IsNullOrEmpty(email))
            {
                _connections.KeepUserConnection(email, Context.ConnectionId);
                await Groups.AddToGroupAsync(Context.ConnectionId, email);

                if (Context.User.IsInRole("Admin"))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "AdminsGroup");
                }
                else
                {
                    await Clients.Group("AdminsGroup").SendAsync("UserStatusChanged", email, true);
                }
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var email = GetEmail();
            if (!string.IsNullOrEmpty(email))
            {
                _connections.RemoveUserConnection(email, Context.ConnectionId);
                
                if (_connections.GetUserConnections(email).Count == 0)
                {
                     await Clients.Group("AdminsGroup").SendAsync("UserStatusChanged", email, false);
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessageToAdmin(string message)
        {
            var userEmail = GetEmail();
            if (userEmail == null) return;

            var chatMsg = new ChatMessage
            {
                Sender = userEmail,
                Receiver = "Admin",
                UserId = userEmail,
                Message = message,
                Timestamp = DateTime.UtcNow,
                IsRead = false 
            };
            _context.ChatMessages.Add(chatMsg);
            await _context.SaveChangesAsync();

            await Clients.Group("AdminsGroup").SendAsync("ReceiveMessage", userEmail, message, "UserToAdmin", null);
            await Clients.Group(userEmail).SendAsync("ReceiveMessage", userEmail, message, "UserToAdmin", null);
        }

        [Authorize(Roles = "Admin")]
        public async Task SendMessageToUser(string targetUserEmail, string message)
        {
            targetUserEmail = targetUserEmail.ToLower();
            var chatMsg = new ChatMessage
            {
                Sender = "Admin",
                Receiver = targetUserEmail,
                UserId = targetUserEmail,
                Message = message,
                Timestamp = DateTime.UtcNow,
                IsRead = true 
            };
            _context.ChatMessages.Add(chatMsg);
            await _context.SaveChangesAsync();

            await Clients.Group(targetUserEmail).SendAsync("ReceiveMessage", "Admin", message, "AdminToUser", targetUserEmail);
            await Clients.Group("AdminsGroup").SendAsync("ReceiveMessage", "Admin", message, "AdminToUser", targetUserEmail);
        }

        private string GetEmail()
        {
            var email = Context.User?.FindFirst(ClaimTypes.Name)?.Value 
                        ?? Context.User?.FindFirst(ClaimTypes.Email)?.Value
                        ?? Context.UserIdentifier;
            return email?.ToLower();
        }
    }
}