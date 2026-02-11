using backend.Services.Interfaces;
using backend.Models; 
using backend.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = GetCurrentUserId();
        if (userId == null) 
            return Unauthorized(new ErrorResponse { Message = "Brak autoryzacji.", ErrorCode = (int)ErrorCode.Unauthorized });

        var notifications = await _notificationService.GetUserNotificationsAsync(userId);
        return Ok(notifications);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var success = await _notificationService.MarkAsReadAsync(id, userId);
        if (!success) return NotFound(new ErrorResponse 
        { 
            Success = false, 
            Message = "Nie znaleziono powiadomienia.", 
            ErrorCode = (int)ErrorCode.NotFound 
        });

        return Ok();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new ErrorResponse { Message = "Brak autoryzacji.", ErrorCode = (int)ErrorCode.Unauthorized });

        await _notificationService.MarkAllAsReadAsync(userId);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new ErrorResponse { Message = "Brak autoryzacji.", ErrorCode = (int)ErrorCode.Unauthorized });

        var success = await _notificationService.DeleteNotificationAsync(id, userId);
        
        if (!success)
            return NotFound(new ErrorResponse 
            { 
                Success = false, 
                Message = "Nie znaleziono powiadomienia lub brak uprawnień.", 
                ErrorCode = (int)ErrorCode.NotFound 
            });

        return Ok(new { Message = "Powiadomienie usunięte." });
    }
    
    [HttpPost("broadcast")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Broadcast([FromBody] BroadcastDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Message))
        {
            return BadRequest(new ErrorResponse 
            { 
                Success = false, 
                Message = "Tytuł i treść powiadomienia są wymagane.", 
                ErrorCode = (int)ErrorCode.ValidationError 
            });
        }

        await _notificationService.BroadcastToAllUsersAsync(dto.Title, dto.Message, dto.Type);
        return Ok(new { Message = "Powiadomienie wysłane do wszystkich użytkowników." });
    }

    private string? GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);
}