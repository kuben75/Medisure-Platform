using backend.DTOs;
using backend.Services.Interfaces;
using backend.Models; 
using backend.Enums;
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
        if (string.IsNullOrEmpty(userId)) 
        {
            return Unauthorized(new ErrorResponse 
            { 
                Success = false, 
                Message = "Nie udało się zidentyfikować użytkownika.", 
                ErrorCode = (int)ErrorCode.Unauthorized 
            });
        }

        await _chatService.MarkMessagesAsReadAsync(userId);
        return Ok();
    }

    [HttpGet("history")]
    [AllowAnonymous]
    public async Task<IActionResult> GetChatHistory()
    {
        var userId = IdentifyUser();
        if (string.IsNullOrEmpty(userId)) 
        {
            return Unauthorized(new ErrorResponse 
            { 
                Success = false, 
                Message = "Brak dostępu do czatu (błąd identyfikacji).", 
                ErrorCode = (int)ErrorCode.Unauthorized 
            });
        }

        var isAdmin = User.Identity?.IsAuthenticated == true && User.IsInRole("Admin");

        var result = await _chatService.GetChatHistoryAsync(userId, isAdmin);
        return Ok(result);
    }

    [HttpPost("mark-read")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkAsRead([FromBody] MarkReadDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.UserEmail))
        {
            return BadRequest(new ErrorResponse 
            { 
                Success = false, 
                Message = "Należy podać adres e-mail użytkownika.", 
                ErrorCode = (int)ErrorCode.ValidationError 
            });
        }
        await _chatService.MarkUserMessagesAsReadByAdminAsync(dto.UserEmail);
        return Ok();
    }

    private string? IdentifyUser()
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            var id = User.FindFirst("email")?.Value 
                     ?? User.FindFirst(ClaimTypes.Email)?.Value 
                     ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value 
                     ?? User.FindFirst("unique_name")?.Value 
                     ?? User.FindFirst(ClaimTypes.Name)?.Value;

            if (!string.IsNullOrEmpty(id)) 
            {
                return id.ToLower();
            }
        }

        if (Request.Headers.TryGetValue("X-Anon-ID", out var anonId))
        {
            var idString = anonId.ToString();
            
            if (idString.Contains("@")) return null; 
            
            return idString;
        }

        return null;
    }
}