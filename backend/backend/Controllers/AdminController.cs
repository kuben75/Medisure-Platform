using backend.Models;
using backend.DTOs;
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

    public AdminController(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext context 
    )
    {
        _userManager = userManager;
        _context = context; 
    }
    [HttpGet("stats")] 
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var totalUsers = await _userManager.Users.CountAsync();
            
        var totalPackages = await _context.Packages.CountAsync();

        var stats = new DashboardStatsDto
        {
            TotalUsers = totalUsers,
            TotalPackagesAvailable = totalPackages,
            ActiveSubscriptions = 0, 
            ExpiringSubscriptions = 0 
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
            {
                return NotFound(new { Message = "Nie znaleziono użytkownika." });
            }

            user.FirstName = updateUserDto.FirstName;
            user.LastName = updateUserDto.LastName;
            user.Email = updateUserDto.Email;
            user.UserName = updateUserDto.Email; 
            user.PhoneNumber = updateUserDto.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { Message = "Użytkownik pomyślnie zaktualizowany." });
            }

            return BadRequest(result.Errors);
        }

        
        [HttpDelete("users/{id}")] 
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { Message = "Nie znaleziono użytkownika." });
            }
            
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (user.Id == currentUserId)
            {
                return BadRequest(new { Message = "Nie możesz usunąć własnego konta administratora." });
            }

            var result = await _userManager.DeleteAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { Message = "Użytkownik pomyślnie usunięty." });
            }

            return BadRequest(result.Errors);
        }
    
}