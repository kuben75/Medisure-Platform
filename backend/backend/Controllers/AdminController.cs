using backend.Models;
using backend.DTOs;
using backend.Services;
using backend.Services.Interfaces;
using backend.Helpers; 
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Data;
using backend.Enums; 

namespace backend.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager; 
    private readonly ApplicationDbContext _context;
    private readonly ILogService _logService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AdminController(
        UserManager<ApplicationUser> userManager, 
        RoleManager<IdentityRole> roleManager, 
        ApplicationDbContext context,
        ILogService logService, 
        IEmailService emailService, 
        IConfiguration configuration)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _logService = logService;
        _emailService = emailService;
        _configuration = configuration;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
        var sevenDaysFromNow = now.AddDays(7);

        var totalUsers = await _context.Users.CountAsync();
        var totalPackages = await _context.Packages.CountAsync();

        var activeSubscriptions = await _context.UserPackages
            .Where(up => up.Status == "Active" && up.EndDate > now)
            .CountAsync();
        
        var expiringSubscriptions = await _context.UserPackages
            .Where(up => up.Status == "Active" && up.EndDate > now && up.EndDate <= sevenDaysFromNow)
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
        var users = await _userManager.Users.AsNoTracking().ToListAsync();
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
        if (user == null) 
            return NotFound(new ErrorResponse { Message = "Nie znaleziono użytkownika.", ErrorCode = (int)ErrorCode.NotFound });
        
        if (!await CanManageUser(user))
            return BadRequest(new ErrorResponse { Message = "Brak uprawnień do edycji tego użytkownika.", ErrorCode = (int)ErrorCode.Forbidden });

        user.FirstName = updateUserDto.FirstName;
        user.LastName = updateUserDto.LastName;
        user.PhoneNumber = updateUserDto.PhoneNumber;
        
        if (user.Email != updateUserDto.Email)
        {
            var emailResult = await _userManager.SetEmailAsync(user, updateUserDto.Email);
            if (!emailResult.Succeeded) 
                return BadRequest(new ErrorResponse { Message = "Błąd zmiany e-maila.", ErrorCode = (int)ErrorCode.ValidationError });
            
            var userResult = await _userManager.SetUserNameAsync(user, updateUserDto.Email);
            if (!userResult.Succeeded) 
                return BadRequest(new ErrorResponse { Message = "Błąd zmiany nazwy użytkownika.", ErrorCode = (int)ErrorCode.ValidationError });
        }

        if (updateUserDto.BirthDate.HasValue)
            user.BirthDate = DateTime.SpecifyKind(updateUserDto.BirthDate.Value, DateTimeKind.Utc);

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            await LogActionAsync("ATUALIZACJA_INFORMACJI", $"Użytkownik '{user.Email}' został zaktualizowany.");
            return Ok(new { Message = "Użytkownik pomyślnie zaktualizowany." });
        }

        return BadRequest(new ErrorResponse { Message = "Nie udało się zaktualizować użytkownika.", ErrorCode = (int)ErrorCode.DatabaseIntegrityError });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) 
            return NotFound(new ErrorResponse { Message = "Nie znaleziono użytkownika.", ErrorCode = (int)ErrorCode.NotFound });

        if (user.Id == GetCurrentUserId())
            return BadRequest(new ErrorResponse { Message = "Nie możesz usunąć własnego konta administratora.", ErrorCode = (int)ErrorCode.BusinessRuleViolation });

        if (!await CanManageUser(user))
            return BadRequest(new ErrorResponse { Message = "Brak uprawnień do usunięcia tego użytkownika.", ErrorCode = (int)ErrorCode.Forbidden });

        var result = await _userManager.DeleteAsync(user);

        if (result.Succeeded)
        {
            await LogActionAsync("USUNIECIE_UZYTKOWNIKA", $"Użytkownik '{user.Email}' został usunięty.");
            return Ok(new { Message = "Użytkownik pomyślnie usunięty." });
        }

        return BadRequest(new ErrorResponse { Message = "Nie udało się usunąć użytkownika.", ErrorCode = (int)ErrorCode.InternalServerError });
    }

    [HttpPut("users/{id}/role")]
    [Authorize(Roles = "SuperAdmin")] 
    public async Task<IActionResult> ChangeUserRole(string id, [FromBody] ChangeRoleDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) 
            return NotFound(new ErrorResponse { Message = "Nie znaleziono użytkownika.", ErrorCode = (int)ErrorCode.NotFound });

        if (user.Id == GetCurrentUserId()) 
            return BadRequest(new ErrorResponse { Message = "Nie możesz zmienić własnej roli.", ErrorCode = (int)ErrorCode.BusinessRuleViolation });
        
        if (!await _roleManager.RoleExistsAsync(dto.NewRole))
            return BadRequest(new ErrorResponse { Message = $"Rola '{dto.NewRole}' nie istnieje.", ErrorCode = (int)ErrorCode.ValidationError });
        
        if (await _userManager.IsInRoleAsync(user, "SuperAdmin"))
            return BadRequest(new ErrorResponse { Message = "Nie można modyfikować uprawnień Głównego Administratora.", ErrorCode = (int)ErrorCode.Forbidden });

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, dto.NewRole);
        
        await LogActionAsync("ZMIANA_ROLI", $"Zmiana roli użytkownika {user.Email} na {dto.NewRole}", "Warning", true);

        return Ok(new { Message = $"Rola użytkownika zmieniona na {dto.NewRole}." });
    }

    [HttpPut("users/{id}/lock")]
    public async Task<IActionResult> LockUser(string id, [FromBody] LockUserDto dto)
    {
        var targetUser = await _userManager.FindByIdAsync(id);
        if (targetUser == null) 
            return NotFound(new ErrorResponse { Message = "Nie znaleziono użytkownika.", ErrorCode = (int)ErrorCode.NotFound });

        if (targetUser.Id == GetCurrentUserId()) 
            return BadRequest(new ErrorResponse { Message = "Nie możesz zablokować samego siebie.", ErrorCode = (int)ErrorCode.BusinessRuleViolation });

        if (!await CanManageUser(targetUser))
            return BadRequest(new ErrorResponse { Message = "Brak uprawnień do zablokowania tego użytkownika.", ErrorCode = (int)ErrorCode.Forbidden });

        var result = await _userManager.SetLockoutEndDateAsync(targetUser, DateTimeOffset.MaxValue);

        if (result.Succeeded)
        {
            await LogActionAsync("BLOKADA_KONTA", $"Zablokowano: {targetUser.Email}. Powód: {dto.Reason}", "Warning");

            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            var supportLink = $"{frontendUrl}/kontakt";
            
            var body = EmailTemplates.GetAccountLockedAlert(targetUser.FirstName, dto.Reason, supportLink);
            await _emailService.SendEmailAsync(targetUser.Email, "Ważne: Twoje konto zostało zablokowane", body);

            return Ok(new { Message = "Użytkownik został zablokowany." });
        }

        return BadRequest(new ErrorResponse { Message = "Nie udało się zablokować użytkownika.", ErrorCode = (int)ErrorCode.InternalServerError });
    }

    [HttpPut("users/{id}/unlock")]
    public async Task<IActionResult> UnlockUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) 
            return NotFound(new ErrorResponse { Message = "Nie znaleziono użytkownika.", ErrorCode = (int)ErrorCode.NotFound });

        if (!await CanManageUser(user))
            return BadRequest(new ErrorResponse { Message = "Brak uprawnień do odblokowania tego użytkownika.", ErrorCode = (int)ErrorCode.Forbidden });

        var result = await _userManager.SetLockoutEndDateAsync(user, null);

        if (result.Succeeded)
        {
            await LogActionAsync("BLOKADA_KONTA", $"Odblokowano: {user.Email}.");

            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            var loginLink = $"{frontendUrl}/login";
            var body = EmailTemplates.GetAccountUnlockedNotification(user.FirstName, loginLink);

            await _emailService.SendEmailAsync(user.Email, "Dostęp do konta przywrócony - Medisure", body);

            return Ok(new { Message = "Użytkownik został odblokowany." });
        }

        return BadRequest(new ErrorResponse { Message = "Nie udało się odblokować użytkownika.", ErrorCode = (int)ErrorCode.InternalServerError });
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
        var currentUserId = GetCurrentUserId();
        var currentUser = await _userManager.FindByIdAsync(currentUserId);
        
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