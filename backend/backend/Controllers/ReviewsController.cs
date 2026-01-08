using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewsService _reviewsService;

    public ReviewsController(IReviewsService reviewsService)
    {
        _reviewsService = reviewsService;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
    {
        var userId = GetCurrentUserId();
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue(ClaimTypes.Name); // Fallback
        
        if (userId == null) return Unauthorized();

        var result = await _reviewsService.AddReviewAsync(dto, userId, userEmail);

        if (!result.Success)
            return BadRequest(new { Message = result.Message });

        return Ok(new { Message = result.Message });
    }

    [HttpGet("package/{packageId}")]
    public async Task<IActionResult> GetPackageReviews(int packageId)
    {
        var reviews = await _reviewsService.GetPackageReviewsAsync(packageId);
        return Ok(reviews);
    }
    
    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPendingReviews()
    {
        var reviews = await _reviewsService.GetPendingReviewsAsync();
        return Ok(reviews);
    }

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveReview(int id)
    {
        var adminId = GetCurrentUserId();
        var adminName = User.Identity?.Name ?? "Admin";

        var success = await _reviewsService.ApproveReviewAsync(id, adminId, adminName);
        if (!success) return NotFound(new { Message = "Nie znaleziono opinii." });

        return Ok(new { Message = "Opinia została zatwierdzona." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RejectReview(int id)
    {
        var adminId = GetCurrentUserId();
        var adminName = User.Identity?.Name ?? "Admin";

        var success = await _reviewsService.RejectReviewAsync(id, adminId, adminName);
        if (!success) return NotFound(new { Message = "Nie znaleziono opinii." });

        return Ok(new { Message = "Opinia została usunięta." });
    }

    [HttpGet("latest")]
    public async Task<IActionResult> GetLatestReviews()
    {
        var reviews = await _reviewsService.GetLatestReviewsAsync();
        return Ok(reviews);
    }

    private string? GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);
}