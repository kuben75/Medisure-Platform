using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost("mark-my-read")]
    [AllowAnonymous]
    public async Task<IActionResult> MarkMyMessagesAsRead()
    {
        var userId = IdentifyUser();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _chatService.MarkMessagesAsReadAsync(userId);
        return Ok();
    }

    [HttpGet("history")]
    [AllowAnonymous]
    public async Task<IActionResult> GetChatHistory()
    {
        var userId = IdentifyUser();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var isAdmin = User.Identity?.IsAuthenticated == true && User.IsInRole("Admin");

        var result = await _chatService.GetChatHistoryAsync(userId, isAdmin);
        return Ok(result);
    }

    [HttpPost("mark-read")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkAsRead([FromBody] MarkReadDto dto)
    {
        await _chatService.MarkUserMessagesAsReadByAdminAsync(dto.UserEmail);
        return Ok();
    }


    private string? IdentifyUser()
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            return User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue(ClaimTypes.Name);
        }

        if (Request.Headers.TryGetValue("X-Anon-ID", out var anonId))
        {
            return anonId.ToString();
        }

        return null;
    }
}