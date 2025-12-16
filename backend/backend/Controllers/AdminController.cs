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
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AdminController(UserManager<ApplicationUser> userManager, ApplicationDbContext context,
        ILogService logService, IEmailService emailService, IConfiguration configuration)
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
            var isLocked = await _userManager.IsLockedOutAsync(user);
            userDtos.Add(new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                BirthDate = user.BirthDate,
                Roles = (await _userManager.GetRolesAsync(user)).ToList(),
                IsLocked = isLocked
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
        if (updateUserDto.BirthDate.HasValue)
        {
            user.BirthDate = updateUserDto.BirthDate.Value.ToUniversalTime();
        }

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            await _logService.LogAsync(
                "ATUALIZACJA_INFORMACJI",
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
                "USUNIECIE_UZYTKOWNIKA",
                $"Użytkownik '{user.Email}' został usunięty przez {User.Identity?.Name ?? "Admin"}.",
                User.Identity?.Name ?? "Admin",
                User.FindFirstValue(ClaimTypes.NameIdentifier) ?? null,
                "info");
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

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (user.Id == currentUserId) return BadRequest(new { Message = "Nie możesz zmienić własnej roli." });

        if (await _userManager.IsInRoleAsync(user, "SuperAdmin"))
            return BadRequest(new { Message = "Nie można modyfikować uprawnień Głównego Administratora." });
        

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, dto.NewRole);
        
        if(dto.NewRole == "Admin") await _userManager.AddToRoleAsync(user, "User");

        await _logService.LogAsync("ZMIANA_ROLI", $"Zmiana roli użytkownika {user.Email} na {dto.NewRole}", User.Identity?.Name, user.Id, "Warning", true);

        return Ok(new { Message = $"Rola użytkownika zmieniona na {dto.NewRole}." });
    }

    [HttpPut("users/{id}/lock")]
    public async Task<IActionResult> LockUser(string id, [FromBody] LockUserDto dto)
    {
        var targetUser = await _userManager.FindByIdAsync(id);
        if (targetUser == null) return NotFound(new { Message = "Nie znaleziono użytkownika." });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (targetUser.Id == currentUserId) return BadRequest(new { Message = "Nie możesz zablokować samego siebie." });

        var currentUserEmail = User.FindFirstValue(ClaimTypes.Email);
        var currentUser = await _userManager.FindByEmailAsync(currentUserEmail);
        
        var amISuperAdmin = await _userManager.IsInRoleAsync(currentUser, "SuperAdmin");
        var isTargetAdmin = await _userManager.IsInRoleAsync(targetUser, "Admin");
        var isTargetSuper = await _userManager.IsInRoleAsync(targetUser, "SuperAdmin");

        if (isTargetSuper)
            return BadRequest(new { Message = "Nie można zablokować Głównego Administratora (Root)." });
        

        if (!amISuperAdmin && isTargetAdmin)
        {
            await _logService.LogAsync("BLOKADA_KONTA", $"Próba blokady admina przez admina.", User.Identity?.Name, currentUserId, "Warning", true);
            return BadRequest(new { Message = "Brak uprawnień. Tylko Super Admin może blokować Administratorów." });
        }

        var result = await _userManager.SetLockoutEndDateAsync(targetUser, DateTimeOffset.MaxValue);

        if (result.Succeeded)
        {
            await _logService.LogAsync("BLOKADA_KONTA", $"Zablokowano: {targetUser.Email}. Powód: {dto.Reason}",
                User.Identity?.Name, targetUser.Id, "Warning");

            var frontendUrl = _configuration["FrontendUrl"];
            var supportLink = $"{frontendUrl}/kontakt";

            var emailBody = $@"
    <div style='font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;'>
        <div style='background-color: #FEE2E2; padding: 30px; text-align: center; border-bottom: 1px solid #FECACA;'>
            <div style='background-color: #EF4444; color: white; width: 60px; height: 60px; border-radius: 50%; line-height: 60px; font-size: 30px; margin: 0 auto 15px auto;'>!</div>
            <h1 style='color: #991B1B; margin: 0; font-size: 24px;'>Konto Zablokowane</h1>
        </div>
        <div style='padding: 40px 30px;'>
            <p style='color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;'>Witaj, <strong>{targetUser.FirstName}</strong>.</p>
            <p style='color: #374151; font-size: 16px; line-height: 1.6;'>
                Informujemy, że Twój dostęp do serwisu Medisure został zablokowany przez administratora.
            </p>
            
            <div style='background-color: #F3F4F6; border-left: 4px solid #6B7280; padding: 15px; margin: 25px 0;'>
                <p style='margin: 0; font-size: 12px; text-transform: uppercase; color: #6B7280; font-weight: bold;'>Powód blokady:</p>
                <p style='margin: 5px 0 0 0; color: #1F2937; font-weight: 500;'>{dto.Reason}</p>
            </div>

            <p style='color: #374151; font-size: 14px; line-height: 1.6;'>
                Jeśli uważasz, że to pomyłka lub chcesz wyjaśnić sytuację, skontaktuj się z naszym Biurem Obsługi Klienta.
            </p>

            <div style='text-align: center; margin-top: 30px;'>
                <a href='{supportLink}' style='background-color: #374151; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;'>Skontaktuj się z nami</a>
            </div>
        </div>
        <div style='background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;'>
            <p style='margin: 0; color: #9CA3AF; font-size: 12px;'>&copy; {DateTime.Now.Year} Medisure Sp. z o.o.</p>
        </div>
    </div>";

            try
            {
                await _emailService.SendEmailAsync(targetUser.Email, "Ważne: Twoje konto zostało zablokowane", emailBody);
            }
            catch (Exception ex)
            {
                await _logService.LogAsync("BLAD_EMAIL",
                    $"Nie udało się wysłać powiadomienia o blokadzie: {ex.Message}", "System", null, "Error");
            }

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
            await _logService.LogAsync("BLOKADA_KONTA", $"Odblokowano: {user.Email}.", User.Identity?.Name, user.Id,
                "Info");

            var frontendUrl = _configuration["FrontendUrl"];
            var loginLink = $"{frontendUrl}/login";

            var emailBody = $@"
    <div style='font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;'>
        <div style='background-color: #4E61F6; padding: 30px; text-align: center;'>
            <div style='background-color: #ffffff; color: #4E61F6; width: 60px; height: 60px; border-radius: 50%; line-height: 60px; font-size: 30px; margin: 0 auto 15px auto;'>✓</div>
            <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Konto Odblokowane</h1>
        </div>
        <div style='padding: 40px 30px;'>
            <p style='color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;'>Witaj, <strong>{user.FirstName}</strong>!</p>
            <p style='color: #374151; font-size: 16px; line-height: 1.6;'>
                Mamy dobre wieści. Blokada Twojego konta została zdjęta przez administratora. Możesz już w pełni korzystać z serwisu Medisure.
            </p>
            
            <div style='text-align: center; margin-top: 35px; margin-bottom: 20px;'>
                <a href='{loginLink}' style='background-color: #4E61F6; color: white; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(78, 97, 246, 0.25);'>Zaloguj się teraz</a>
            </div>
            
            <p style='color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;'>
                Jeśli przycisk nie działa, przejdź tutaj:<br>
                <a href='{loginLink}' style='color: #4E61F6;'>{loginLink}</a>
            </p>
        </div>
        <div style='background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;'>
            <p style='margin: 0; color: #9CA3AF; font-size: 12px;'>&copy; {DateTime.Now.Year} Medisure Sp. z o.o.</p>
        </div>
    </div>";

            try
            {
                await _emailService.SendEmailAsync(user.Email, "Dostęp do konta przywrócony - Medisure", emailBody);
            }
            catch (Exception ex)
            {
                await _logService.LogAsync("BLAD_EMAIL", $"Błąd wysyłki info o odblokowaniu: {ex.Message}", "System",
                    null, "Error");
            }

            return Ok(new { Message = "Użytkownik został odblokowany." });
        }

        return BadRequest(new { Message = "Nie udało się odblokować użytkownika." });
    }
    
    [HttpGet("logs")]
    public async Task<ActionResult<List<SystemLog>>> GetLogs()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId);
        var isSuperAdmin = await _userManager.IsInRoleAsync(user, "SuperAdmin");

        var query = _context.SystemLogs.AsQueryable();

        if (!isSuperAdmin) query = query.Where(log => log.IsSensitive == false);
        

        var logs = await query.OrderByDescending(l => l.CreatedAt).Take(100).ToListAsync();

        return Ok(logs);
    }
}