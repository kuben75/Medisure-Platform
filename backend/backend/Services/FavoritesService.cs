using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IFavoritesService
{
    Task<(bool IsFavorite, string Message)> ToggleFavoriteAsync(int packageId, string userId, string userName);
    Task<IEnumerable<Package>> GetUserFavoritesAsync(string userId);
    Task<List<int>> GetUserFavoriteIdsAsync(string userId);
    Task<bool> IsFavoriteAsync(int packageId, string userId);
}

public class FavoritesService : IFavoritesService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogService _logService;

    public FavoritesService(ApplicationDbContext context, ILogService logService)
    {
        _context = context;
        _logService = logService;
    }

    public async Task<(bool IsFavorite, string Message)> ToggleFavoriteAsync(int packageId, string userId, string userName)
    {
        var package = await _context.Packages.FindAsync(packageId);
        if (package == null) throw new KeyNotFoundException("Pakiet nie istnieje.");

        var existingFavorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.PackageId == packageId);

        if (existingFavorite != null)
        {
            _context.Favorites.Remove(existingFavorite);
            await _context.SaveChangesAsync();
            
            await _logService.LogAsync(
                "USUN_ULUBIONE", 
                $"Użytkownik '{userName}' usunął pakiet '{package.Name}' z ulubionych.", 
                userName, 
                userId);
            
            return (false, "Usunięto z ulubionych");
        }
        else
        {
            var newFavorite = new Favorite
            {
                UserId = userId,
                PackageId = packageId
            };
            _context.Favorites.Add(newFavorite);
            await _context.SaveChangesAsync();
            
            await _logService.LogAsync(
                "DODAJ_ULUBIONE", 
                $"Użytkownik '{userName}' dodał pakiet '{package.Name}' do ulubionych.", 
                userName, 
                userId);
            
            return (true, "Dodano do ulubionych");
        }
    }

    public async Task<IEnumerable<Package>> GetUserFavoritesAsync(string userId)
    {
        return await _context.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.Package)
            .Select(f => f.Package)
            .ToListAsync();
    }

    public async Task<List<int>> GetUserFavoriteIdsAsync(string userId)
    {
        return await _context.Favorites
            .Where(f => f.UserId == userId)
            .Select(f => f.PackageId)
            .ToListAsync();
    }

    public async Task<bool> IsFavoriteAsync(int packageId, string userId)
    {
        return await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.PackageId == packageId);
    }
}