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
[Authorize]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserConnectionManager _connectionManager;

    public ChatController(ApplicationDbContext context, UserConnectionManager connectionManager)
    {
        _context = context;
        _connectionManager = connectionManager;
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetChatHistory()
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue(ClaimTypes.Name);
        if (userEmail == null) return Unauthorized();
        userEmail = userEmail.ToLower();

        if (User.IsInRole("Admin"))
        {
            var messages = await _context.ChatMessages.OrderBy(m => m.Timestamp).ToListAsync();
            
            var userEmails = messages.Where(m => m.UserId != "Admin").Select(m => m.UserId).Distinct().ToList();
            
            var usersDetails = await _context.Users
                .Where(u => userEmails.Contains(u.Email))
                .Select(u => new { u.Email, u.FirstName, u.LastName })
                .ToDictionaryAsync(u => u.Email.ToLower());

            return Ok(new { 
                Messages = messages, 
                Users = usersDetails,
                OnlineUsers = _connectionManager.GetOnlineUsers() 
            });
        }
        else
        {
            var history = await _context.ChatMessages
                .Where(m => m.UserId.ToLower() == userEmail)
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