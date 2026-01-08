using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/subscriptions")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionsController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    [HttpPost("{packageId}")]
    public async Task<IActionResult> Subscribe(int packageId, [FromBody] SubscribeDto dto)
    {
        var userId = GetCurrentUserId();
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        
        if (userId == null) return Unauthorized();

        var result = await _subscriptionService.SubscribeAsync(packageId, dto, userId, userEmail);

        if (!result.Success) return BadRequest(new { Message = result.Message });

        return Ok(new { Message = result.Message, User = result.Data });
    }

    [HttpGet]
    public async Task<IActionResult> GetMySubscriptions()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var subs = await _subscriptionService.GetUserSubscriptionsAsync(userId);
        return Ok(subs);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelSubscription(int id)
    {
        var userId = GetCurrentUserId();
        var userName = User.Identity?.Name;
        
        if (userId == null) return Unauthorized();

        var result = await _subscriptionService.CancelSubscriptionAsync(id, userId, userName);

        if (!result.Success) return BadRequest(new { Message = result.Message });

        return Ok(new { Message = result.Message });
    }

    private string? GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);
}