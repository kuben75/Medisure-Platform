using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogService _logService;
    private readonly INotificationService _notificationService;

    public ReviewsController(ApplicationDbContext context, ILogService logService, INotificationService notificationService)
    {
        _context = context;
        _logService = logService;
        _notificationService = notificationService;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
    {
        var userIdOrEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdOrEmail == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userIdOrEmail || u.Email == userIdOrEmail);
        if (user == null) return Unauthorized();

        var hasPurchased = await _context.UserPackages
            .AnyAsync(up => up.UserId == user.Id && up.PackageId == dto.PackageId);

        if (!hasPurchased)
            return BadRequest(new { Message = "Możesz ocenić tylko pakiety, które posiadasz." });

        var existingReview = await _context.Reviews
            .AnyAsync(r => r.UserId == user.Id && r.PackageId == dto.PackageId);

        if (existingReview)
            return BadRequest(new { Message = "Już oceniłeś ten pakiet." });

        var review = new Review
        {
            UserId = user.Id,
            PackageId = dto.PackageId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow,
            IsApproved = false
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        await _logService.LogAsync(
            "DODANIE_OPINII",
            $"Użytkownik {user.Email} dodał opinię dla pakietu ID {dto.PackageId}.",
            user.Email ?? "Unknown",
            user.Id,
            "Info");
        
        await _notificationService.NotifyAllAdminsAsync(
            "Nowa opinia do moderacji", 
            $"Użytkownik {user.Email} dodał opinię do pakietu ID {dto.PackageId}. Sprawdź panel moderacji.", 
            "Opinie"
        );
        return Ok(new { Message = "Dziękujemy! Twoja opinia czeka na zatwierdzenie przez moderatora." });
    }

    [HttpGet("package/{packageId}")]
    public async Task<IActionResult> GetPackageReviews(int packageId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.PackageId == packageId && r.IsApproved) 
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                UserName = r.User.FirstName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                IsApproved = r.IsApproved
            })
            .ToListAsync();

        return Ok(reviews);
    }
    
    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPendingReviews()
    {
        var reviews = await _context.Reviews
            .Where(r => !r.IsApproved) 
            .Include(r => r.User)
            .Include(r => r.Package) 
            .OrderBy(r => r.CreatedAt)
            .Select(r => new 
            {
                Id = r.Id,
                UserName = r.User.FirstName + " " + r.User.LastName,
                UserEmail = r.User.Email,
                PackageName = r.Package.Name,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
        return Ok(reviews);
    }
    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound(new { Message = "Nie znaleziono opinii." });

        review.IsApproved = true;
        await _context.SaveChangesAsync();

        var package = await _context.Packages.FindAsync(review.PackageId);
        if (package != null)
        {
            var approvedReviews = await _context.Reviews
                .Where(r => r.PackageId == review.PackageId && r.IsApproved)
                .ToListAsync();

            if (approvedReviews.Any())
            {
                package.AverageRating = approvedReviews.Average(r => r.Rating);
                package.Reviews = approvedReviews.Count;
            }
            await _context.SaveChangesAsync();
        }
        await _notificationService.CreateNotificationAsync(
            review.UserId,
            "Twoja opinia została zatwierdzona",
            $"Twoja opinia dotycząca pakietu ID {review.PackageId} została zatwierdzona przez moderatora.",
            "Opinie"
        );
        
        await _logService.LogAsync(
            "ZAAKCEPTOWANIE_OPINII",
            $"Opinia ID {id} została zatwierdzona.",
            User.Identity?.Name ?? "Admin",
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? null,
            "Info");
        return Ok(new { Message = "Opinia została zatwierdzona." });
    }
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RejectReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound(new { Message = "Nie znaleziono opinii." });

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        await _logService.LogAsync(
            "ODRZUCENIE_OPINII",
            $"Opinia ID {id} została odrzucona i usunięta.",
            User.Identity?.Name ?? "Admin",
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? null,
            "Info");
        return Ok(new { Message = "Opinia została usunięta." });
    }
    [HttpGet("latest")]
    public async Task<IActionResult> GetLatestReviews()
    {
        var reviews = await _context.Reviews
            .Where(r => r.IsApproved && r.Rating >= 4) 
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Take(3)
            .Select(r => new 
            {
                Id = r.Id,
                UserName = r.User.FirstName,
                AvatarText = r.User.FirstName.Substring(0,1).ToUpper(),
                Rating = r.Rating,
                Comment = r.Comment
            })
            .ToListAsync();

        return Ok(reviews);
    }
}