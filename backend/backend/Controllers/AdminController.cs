using backend.Models;
using backend.DTOs;
using backend.Services;
using backend.Helpers; 
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
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AdminController(
        UserManager<ApplicationUser> userManager, 
        ApplicationDbContext context,
        ILogService logService, 
        IEmailService emailService, 
        IConfiguration configuration)
    {
        _userManager = userManager;
        _context = context;
        _logService = logService;
        _emailService = emailService;
        _configuration = configuration;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var now = DateTime.UtcNow;
        var sevenDaysFromNow = now.AddDays(7);

        var totalUsers = await _context.Users.CountAsync();
        var totalPackages = await _context.Packages.CountAsync();

        var activeSubscriptions = await _context.UserPackages
            .Where(up => up.Status == "Active" && up.EndDate > now)
            .CountAsync();

        var expiringSubscriptions = await _context.UserPackages
            .Where(up => up.EndDate > now && up.EndDate <= sevenDaysFromNow)
            .CountAsync();

        return Ok(new DashboardStatsDto
        {
            TotalUsers = totalUsers,
            TotalPackagesAvailable = totalPackages,
            ActiveSubscriptions = activeSubscriptions,
            ExpiringSubscriptions = expiringSubscriptions
        });
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
                BirthDate = user.BirthDate,
                Roles = (await _userManager.GetRolesAsync(user)).ToList(),
                IsLocked = await _userManager.IsLockedOutAsync(user)
            });
        }

        return Ok(userDtos);
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { Message = "Nie znaleziono użytkownika." });

        user.FirstName = updateUserDto.FirstName;
        user.LastName = updateUserDto.LastName;
        user.Email = updateUserDto.Email;
        user.UserName = updateUserDto.Email;
        user.PhoneNumber = updateUserDto.PhoneNumber;
        
        if (updateUserDto.BirthDate.HasValue)
            user.BirthDate = updateUserDto.BirthDate.Value.ToUniversalTime();

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            await LogActionAsync("ATUALIZACJA_INFORMACJI", $"Użytkownik '{user.Email}' został zaktualizowany.");
            return Ok(new { Message = "Użytkownik pomyślnie zaktualizowany." });
        }

        return BadRequest(result.Errors);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { Message = "Nie znaleziono użytkownika." });

        if (user.Id == GetCurrentUserId())
            return BadRequest(new { Message = "Nie możesz usunąć własnego konta administratora." });

        var result = await _userManager.DeleteAsync(user);

        if (result.Succeeded)
        {
            await LogActionAsync("USUNIECIE_UZYTKOWNIKA", $"Użytkownik '{user.Email}' został usunięty.");
            return Ok(new { Message = "Użytkownik pomyślnie usunięty." });
        }

        return BadRequest(result.Errors);
    }

    [HttpPut("users/{id}/role")]
    [Authorize(Roles = "SuperAdmin")] 
    public async Task<IActionResult> ChangeUserRole(string id, [FromBody] ChangeRoleDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { Message = "Nie znaleziono użytkownika." });

        if (user.Id == GetCurrentUserId()) return BadRequest(new { Message = "Nie możesz zmienić własnej roli." });

        if (await _userManager.IsInRoleAsync(user, "SuperAdmin"))
            return BadRequest(new { Message = "Nie można modyfikować uprawnień Głównego Administratora." });

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, dto.NewRole);
        
        if (dto.NewRole == "Admin") await _userManager.AddToRoleAsync(user, "User");

        await LogActionAsync("ZMIANA_ROLI", $"Zmiana roli użytkownika {user.Email} na {dto.NewRole}", "Warning", true);

        return Ok(new { Message = $"Rola użytkownika zmieniona na {dto.NewRole}." });
    }

    [HttpPut("users/{id}/lock")]
    public async Task<IActionResult> LockUser(string id, [FromBody] LockUserDto dto)
    {
        var targetUser = await _userManager.FindByIdAsync(id);
        if (targetUser == null) return NotFound(new { Message = "Nie znaleziono użytkownika." });

        if (targetUser.Id == GetCurrentUserId()) return BadRequest(new { Message = "Nie możesz zablokować samego siebie." });

        if (!await CanManageUser(targetUser))
            return BadRequest(new { Message = "Brak uprawnień do zablokowania tego użytkownika." });

        var result = await _userManager.SetLockoutEndDateAsync(targetUser, DateTimeOffset.MaxValue);

        if (result.Succeeded)
        {
            await LogActionAsync("BLOKADA_KONTA", $"Zablokowano: {targetUser.Email}. Powód: {dto.Reason}", "Warning");

            var supportLink = $"{_configuration["FrontendUrl"]}/kontakt";
            var body = EmailTemplates.GetAccountLockedAlert(targetUser.FirstName, dto.Reason, supportLink);
            
            _ = _emailService.SendEmailAsync(targetUser.Email, "Ważne: Twoje konto zostało zablokowane", body); 

            return Ok(new { Message = "Użytkownik został zablokowany." });
        }

        return BadRequest(new { Message = "Nie udało się zablokować użytkownika." });
    }

    [HttpPut("users/{id}/unlock")]
    public async Task<IActionResult> UnlockUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { Message = "Nie znaleziono użytkownika." });

        var result = await _userManager.SetLockoutEndDateAsync(user, null);

        if (result.Succeeded)
        {
            await LogActionAsync("BLOKADA_KONTA", $"Odblokowano: {user.Email}.");

            var loginLink = $"{_configuration["FrontendUrl"]}/login";
            var body = EmailTemplates.GetAccountUnlockedNotification(user.FirstName, loginLink);

            _ = _emailService.SendEmailAsync(user.Email, "Dostęp do konta przywrócony - Medisure", body);

            return Ok(new { Message = "Użytkownik został odblokowany." });
        }

        return BadRequest(new { Message = "Nie udało się odblokować użytkownika." });
    }
    
    [HttpGet("logs")]
    public async Task<ActionResult<List<SystemLog>>> GetLogs()
    {
        var user = await _userManager.FindByIdAsync(GetCurrentUserId());
        var isSuperAdmin = await _userManager.IsInRoleAsync(user, "SuperAdmin");

        var query = _context.SystemLogs.AsQueryable();

        if (!isSuperAdmin) query = query.Where(log => log.IsSensitive == false);

        return Ok(await query.OrderByDescending(l => l.CreatedAt).Take(100).ToListAsync());
    }


    private string GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    private async Task<bool> CanManageUser(ApplicationUser targetUser)
    {
        var currentUser = await _userManager.FindByIdAsync(GetCurrentUserId());
        var amISuperAdmin = await _userManager.IsInRoleAsync(currentUser, "SuperAdmin");
        var isTargetAdmin = await _userManager.IsInRoleAsync(targetUser, "Admin");
        var isTargetSuper = await _userManager.IsInRoleAsync(targetUser, "SuperAdmin");

        if (isTargetSuper) return false; 
        if (!amISuperAdmin && isTargetAdmin) return false; 

        return true;
    }

    private async Task LogActionAsync(string action, string description, string level = "info", bool isSensitive = false)
    {
        var userName = User.Identity?.Name ?? "Admin";
        var userId = GetCurrentUserId();
        
        var fullDesc = description.Contains("przez") ? description : $"{description} przez {userName}.";

        await _logService.LogAsync(action, fullDesc, userName, userId, level, isSensitive);
    }
}