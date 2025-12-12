using backend.Data;
using backend.Models;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserConnectionManager _connectionManager;

    public ChatController(ApplicationDbContext context, UserConnectionManager connectionManager)
    {
        _context = context;
        _connectionManager = connectionManager;
    }

    [HttpPost("mark-my-read")]
    [AllowAnonymous] 
    public async Task<IActionResult> MarkMyMessagesAsRead()
    {
        string userId = null;

        if (User.Identity?.IsAuthenticated == true)
            userId = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue(ClaimTypes.Name);
        
        
        if (string.IsNullOrEmpty(userId))
        {
            if (Request.Headers.TryGetValue("X-Anon-ID", out var anonId))
                userId = anonId.ToString();
            
        }

        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        
        userId = userId.ToLower();
        
        var unreadMsgs = await _context.ChatMessages
            .Where(m => m.Receiver.ToLower() == userId && !m.IsRead)
            .ToListAsync();

        if (unreadMsgs.Any())
        {
            foreach (var msg in unreadMsgs) 
            {
                msg.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }

        return Ok();
    }
    [HttpGet("history")]
    [AllowAnonymous]
    public async Task<IActionResult> GetChatHistory()
    {
        string userIdentifier = null;
        bool isAdmin = false;

        if (User.Identity != null && User.Identity.IsAuthenticated)
        {
            userIdentifier = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue(ClaimTypes.Name);
            isAdmin = User.IsInRole("Admin");
        }

        if (string.IsNullOrEmpty(userIdentifier))
        {
            if (Request.Headers.TryGetValue("X-Anon-ID", out var anonId))
                userIdentifier = anonId.ToString();
        }

        if (string.IsNullOrEmpty(userIdentifier))
            return Unauthorized();


        userIdentifier = userIdentifier.ToLower();

        if (isAdmin)
        {
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

            return Ok(new
            {
                Messages = messages,
                Users = allUsersDetails,
                OnlineUsers = _connectionManager.GetOnlineUsers()
            });
        }
        else
        {
            var history = await _context.ChatMessages
                .Where(m => m.UserId.ToLower() == userIdentifier)
                .OrderBy(m => m.Timestamp)
                .ToListAsync();

            return Ok(history);
        }
    }

    [HttpPost("mark-read")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkAsRead([FromBody] MarkReadDto dto)
    {
        var unreadMsgs = await _context.ChatMessages
            .Where(m => m.UserId == dto.UserEmail.ToLower() && m.Sender != "Admin" && !m.IsRead)
            .ToListAsync();

        if (unreadMsgs.Any())
        {
            foreach (var msg in unreadMsgs) msg.IsRead = true;
            await _context.SaveChangesAsync();
        }

        return Ok();
    }
}