using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using backend.Services.Interfaces;

namespace backend.Services;


public class ReviewsService : IReviewsService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogService _logService;
    private readonly INotificationService _notificationService;

    public ReviewsService(ApplicationDbContext context, ILogService logService, INotificationService notificationService)
    {
        _context = context;
        _logService = logService;
        _notificationService = notificationService;
    }

    public async Task<(bool Success, string Message)> AddReviewAsync(CreateReviewDto dto, string userId, string userEmail)
    {
        var hasPurchased = await _context.UserPackages
            .AnyAsync(up => up.UserId == userId && up.PackageId == dto.PackageId);

        if (!hasPurchased)
            return (false, "Możesz ocenić tylko pakiety, które posiadasz.");

        var existingReview = await _context.Reviews
            .AnyAsync(r => r.UserId == userId && r.PackageId == dto.PackageId);

        if (existingReview)
            return (false, "Już oceniłeś ten pakiet.");

        var review = new Review
        {
            UserId = userId,
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
            $"Użytkownik {userEmail} dodał opinię dla pakietu ID {dto.PackageId}.",
            userEmail,
            userId,
            "Info");
        
        await _notificationService.NotifyAllAdminsAsync(
            "Nowa opinia do moderacji", 
            $"Użytkownik {userEmail} dodał opinię do pakietu ID {dto.PackageId}. Sprawdź panel moderacji.", 
            "Opinie"
        );

        return (true, "Dziękujemy! Twoja opinia czeka na zatwierdzenie przez moderatora.");
    }

    public async Task<IEnumerable<ReviewDto>> GetPackageReviewsAsync(int packageId)
    {
        return await _context.Reviews
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
    }

    public async Task<IEnumerable<object>> GetPendingReviewsAsync()
    {
        return await _context.Reviews
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
    }

    public async Task<bool> ApproveReviewAsync(int reviewId, string adminId, string adminName)
    {
        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null) throw new KeyNotFoundException("Opinia nie istnieje");

        review.IsApproved = true;
        await _context.SaveChangesAsync(); 

        await RecalculatePackageRatingAsync(review.PackageId);

        await _notificationService.CreateNotificationAsync(
            review.UserId,
            "Opinia zatwierdzona",
            $"Twoja opinia do pakietu ID {review.PackageId} została opublikowana.",
            "Opinie"
        );
        
        await _logService.LogAsync("ZAAKCEPTOWANIE_OPINII", $"Opinia ID {reviewId} zatwierdzona.", adminName, adminId, "Info");

        return true;
    }

    public async Task<bool> RejectReviewAsync(int reviewId, string adminId, string adminName)
    {
        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null) return false;

        bool wasApproved = review.IsApproved;
        int packageId = review.PackageId;

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        if (wasApproved)
        {
            await RecalculatePackageRatingAsync(packageId);
        }

        await _logService.LogAsync("ODRZUCENIE_OPINII", $"Opinia ID {reviewId} usunięta.", adminName, adminId, "Info");

        return true;
    }
    private async Task RecalculatePackageRatingAsync(int packageId)
    {
        var package = await _context.Packages.FindAsync(packageId);
        if (package == null) return;

        var stats = await _context.Reviews
            .Where(r => r.PackageId == packageId && r.IsApproved)
            .GroupBy(r => r.PackageId)
            .Select(g => new { Average = g.Average(r => r.Rating), Count = g.Count() })
            .FirstOrDefaultAsync();

        if (stats != null)
        {
            package.AverageRating = stats.Average;
            package.Reviews = stats.Count;
        }
        else
        {
            package.AverageRating = 0;
            package.Reviews = 0;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<object>> GetLatestReviewsAsync()
    {
        return await _context.Reviews
            .Where(r => r.IsApproved && r.Rating >= 4)
            .Include(r => r.User)
            .Include(r => r.Package) 
            .OrderBy(r => Guid.NewGuid()) 
            .Take(5) 
            .Select(r => new 
            {
                Id = r.Id,
                UserName = r.User.FirstName,
                AvatarText = !string.IsNullOrEmpty(r.User.FirstName) ? r.User.FirstName.Substring(0,1).ToUpper() : "U", 
                Rating = r.Rating,
                Comment = r.Comment,
                PackageName = r.Package.Name 
            })
            .ToListAsync();
    }
}