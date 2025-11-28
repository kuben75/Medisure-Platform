using backend.Models;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Data; 
namespace backend.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;
    private readonly ILogService _logService;

    public AdminController(UserManager<ApplicationUser> userManager, ApplicationDbContext context, ILogService logService)
    {
        _userManager = userManager;
        _context = context; 
        _logService = logService;
    }
    [HttpGet("stats")] 
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var now = DateTime.UtcNow;
        var sevenDaysFromNow = now.AddDays(7);
        
        var totalUsers = await _userManager.Users.CountAsync();
            
        var totalPackages = await _context.Packages.CountAsync();

        var activeSubscriptions = await _context.UserPackages
            .AsQueryable()
            .Where(up => up.Status == "Active")
            .Where(up => up.EndDate > now)
            .CountAsync();

        var expiringSubscriptions = await _context.UserPackages
            .AsQueryable()
            .Where(up => up.EndDate > now && up.EndDate <= sevenDaysFromNow)
            .CountAsync();

        var stats = new DashboardStatsDto
        {
            TotalUsers = totalUsers,
            TotalPackagesAvailable = totalPackages,
            ActiveSubscriptions = activeSubscriptions, 
            ExpiringSubscriptions = expiringSubscriptions 
        };

        return Ok(stats);
    }
        
    [HttpGet("users")] 
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        var users = await _userManager.Users.ToListAsync();
            
        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            userDtos.Add(new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Roles = (await _userManager.GetRolesAsync(user)).ToList()
            });
        }

        return Ok(userDtos);
    }
     [HttpPut("users/{id}")] 
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "Nie znaleziono użytkownika." });
            

            user.FirstName = updateUserDto.FirstName;
            user.LastName = updateUserDto.LastName;
            user.Email = updateUserDto.Email;
            user.UserName = updateUserDto.Email; 
            user.PhoneNumber = updateUserDto.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                await _logService.LogAsync(
                    "UPDATE_USER", 
                    $"Użytkownik '{user.Email}' został zaktualizowany przez {User.Identity?.Name ?? "Admin"}.", 
                    User.Identity?.Name ?? "Admin", 
                    User.FindFirstValue(ClaimTypes.NameIdentifier) ?? null, 
                    "info");
                return Ok(new { Message = "Użytkownik pomyślnie zaktualizowany." });
            }

            return BadRequest(result.Errors);
        }

        
        [HttpDelete("users/{id}")] 
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            
            if (user == null)
                return NotFound(new { Message = "Nie znaleziono użytkownika." });
            
            
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (user.Id == currentUserId)
                return BadRequest(new { Message = "Nie możesz usunąć własnego konta administratora." });
            

            var result = await _userManager.DeleteAsync(user);

            if (result.Succeeded)
            {
                await _logService.LogAsync(
                    "DELETE_USER", 
                    $"Użytkownik '{user.Email}' został usunięty przez {User.Identity?.Name ?? "Admin"}.", 
                    User.Identity?.Name ?? "Admin", 
                    User.FindFirstValue(ClaimTypes.NameIdentifier) ?? null, 
                    "info");
                return Ok(new { Message = "Użytkownik pomyślnie usunięty." });
            }

            return BadRequest(result.Errors);
        }
    
}