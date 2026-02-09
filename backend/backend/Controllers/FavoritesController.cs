using backend.Models; 
using backend.Enums;  
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoritesService _favoritesService;

    public FavoritesController(IFavoritesService favoritesService)
    {
        _favoritesService = favoritesService;
    }
    
    [HttpPost("{packageId}")]
    public async Task<IActionResult> ToggleFavorite(int packageId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) 
        {
            return Unauthorized(new ErrorResponse 
            { 
                Success = false, 
                Message = "Brak autoryzacji.", 
                ErrorCode = (int)ErrorCode.Unauthorized 
            });
        }

        var userName = User.Identity?.Name ?? "Nieznany";


        var result = await _favoritesService.ToggleFavoriteAsync(packageId, userId, userName);
        
        return Ok(new { Message = result.Message, IsFavorite = result.IsFavorite });
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Package>>> GetMyFavorites()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new ErrorResponse { Message = "Brak autoryzacji.", ErrorCode = (int)ErrorCode.Unauthorized });

        var favorites = await _favoritesService.GetUserFavoritesAsync(userId);
        return Ok(favorites);
    }
    
    [HttpGet("check/{packageId}")]
    public async Task<ActionResult<bool>> IsFavorite(int packageId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Ok(false); 

        var exists = await _favoritesService.IsFavoriteAsync(packageId, userId);
        return Ok(exists);
    }
    
    [HttpGet("ids")]
    public async Task<ActionResult<List<int>>> GetFavoriteIds()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Ok(new List<int>());

        var ids = await _favoritesService.GetUserFavoriteIdsAsync(userId);
        return Ok(ids);
    }

    private string? GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);
}