using backend.Models;

namespace backend.Services.Interfaces;

public interface IFavoritesService
{
    Task<(bool IsFavorite, string Message)> ToggleFavoriteAsync(int packageId, string userId, string userName);
    Task<IEnumerable<Package>> GetUserFavoritesAsync(string userId);
    Task<List<int>> GetUserFavoriteIdsAsync(string userId);
    Task<bool> IsFavoriteAsync(int packageId, string userId);
}