using backend.DTOs;
namespace backend.Services.Interfaces;

public interface IReviewsService
{
    Task<(bool Success, string Message)> AddReviewAsync(CreateReviewDto dto, string userId, string userEmail);
    Task<IEnumerable<ReviewDto>> GetPackageReviewsAsync(int packageId);
    Task<IEnumerable<object>> GetPendingReviewsAsync(); 
    Task<bool> ApproveReviewAsync(int reviewId, string adminId, string adminName);
    Task<bool> RejectReviewAsync(int reviewId, string adminId, string adminName);
    Task<IEnumerable<object>> GetLatestReviewsAsync();
}