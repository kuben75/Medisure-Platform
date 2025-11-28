using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize] 
public class FavoritesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogService _logService;

    public FavoritesController(ApplicationDbContext context, ILogService logService)
    {
        _context = context;
        _logService = logService;
    }
    
    [HttpPost("{packageId}")]
    public async Task<IActionResult> ToggleFavorite(int packageId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var package = await _context.Packages.FindAsync(packageId);
        if (package == null) return NotFound("Pakiet nie istnieje.");
        

        var existingFavorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.PackageId == packageId);

        if (existingFavorite != null)
        {
            _context.Favorites.Remove(existingFavorite);
            await _context.SaveChangesAsync();
            await _logService.LogAsync(
                "REMOVE_FAVORITE", 
                $"Użytkownik '{User.Identity?.Name ?? "Nieznany"}' usunął pakiet '{package.Name}' z ulubionych.", 
                User.Identity?.Name ?? "Nieznany", 
                userId);
            return Ok(new { Message = "Usunięto z ulubionych", IsFavorite = false });
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
                "ADD_FAVORITE", 
                $"Użytkownik '{User.Identity?.Name ?? "Nieznany"}' dodał pakiet '{package.Name}' do ulubionych.", 
                User.Identity?.Name ?? "Nieznany", 
                userId);
            return Ok(new { Message = "Dodano do ulubionych", IsFavorite = true });
        }
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Package>>> GetMyFavorites()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var favorites = await _context.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.Package) 
            .Select(f => f.Package) 
            .ToListAsync();

        return Ok(favorites);
    }
    
    [HttpGet("check/{packageId}")]
    public async Task<ActionResult<bool>> IsFavorite(int packageId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return false; 

        var exists = await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.PackageId == packageId);

        return Ok(exists);
    }
    
    [HttpGet("ids")]
    public async Task<ActionResult<List<int>>> GetFavoriteIds()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Ok(new List<int>());

        var ids = await _context.Favorites
            .Where(f => f.UserId == userId)
            .Select(f => f.PackageId)
            .ToListAsync();

        return Ok(ids);
    }
}