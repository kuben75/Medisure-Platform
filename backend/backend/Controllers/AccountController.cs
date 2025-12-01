using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 
using System.Security.Claims;
using backend.Data;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/account")]
    [Authorize] 
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogService _logService;
        private readonly ApplicationDbContext _context;

        public AccountController(UserManager<ApplicationUser> userManager, ILogService logService, ApplicationDbContext context)
        {
            _userManager = userManager;
            _logService = logService;
            _context = context;
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserDto updateDto)
        {
            var userIdOrEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userIdOrEmail)) 
            {
                return Unauthorized();
            }
            
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.Id == userIdOrEmail || u.Email == userIdOrEmail);
            
            if (user == null) return Unauthorized();

            user.FirstName = updateDto.FirstName;
            user.LastName = updateDto.LastName;
            user.PhoneNumber = updateDto.PhoneNumber;

            if (!string.IsNullOrEmpty(updateDto.Pesel))
            {
                var peselExists = await _context.Users
                    .AnyAsync(u => u.Pesel == updateDto.Pesel && u.Id != user.Id);

                if (peselExists)
                {
                    await _logService.LogAsync("UPDATE_PROFILE_FAILED", $"Próba użycia zajętego PESELu: {updateDto.Pesel}", user.UserName, user.Id, "Warning");
                    return BadRequest(new { Message = "Ten numer PESEL jest już przypisany do innego konta." });
                }

                user.Pesel = updateDto.Pesel;
            }


            if (updateDto.BirthDate.HasValue)
            {
                var today = DateTime.UtcNow.Date;
                var birthDate = updateDto.BirthDate.Value.Date;
                
                var age = today.Year - birthDate.Year;
                if (birthDate > today.AddYears(-age)) age--;

                if (age < 18)
                {
                    await _logService.LogAsync("UPDATE_PROFILE_REJECTED", $"Próba ustawienia wieku < 18 lat ({age}).", user.UserName, user.Id, "Warning");
                    return BadRequest(new { Message = "Musisz mieć ukończone 18 lat, aby korzystać z serwisu." });
                }

                if (age > 99)
                {
                    return BadRequest(new { Message = "Podana data urodzenia jest nieprawidłowa." });
                }

                user.BirthDate = DateTime.SpecifyKind(updateDto.BirthDate.Value, DateTimeKind.Utc);
            }
            if (user.Email != updateDto.Email)
            {
                var emailExists = await _userManager.FindByEmailAsync(updateDto.Email);

                if (emailExists != null && emailExists.Id != user.Id)
                {
                    await _logService.LogAsync(
                        "UPDATE_PROFILE_FAILED", 
                        $"Nieudana próba aktualizacji profilu użytkownika '{user.UserName}' z powodu zajętego e-maila '{updateDto.Email}'.", 
                        user.UserName, 
                        user.Id,
                        "Warning");
                    return BadRequest(new { Message = "Ten adres e-mail jest już zajęty." });
                }

                user.Email = updateDto.Email;
                user.UserName = updateDto.Email;
            }

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                await _logService.LogAsync(
                    "UPDATE_PROFILE", 
                    $"Profil użytkownika '{user.UserName}' został zaktualizowany.", 
                    user.UserName, 
                    user.Id);
                return Ok(new { 
                    email = user.Email, 
                    firstName = user.FirstName, 
                    lastName = user.LastName,
                    phoneNumber = user.PhoneNumber, 
                    birthDate = user.BirthDate,
                    pesel = user.Pesel
                });
            }
            await _logService.LogAsync(
                "UPDATE_PROFILE_FAILED", 
                $"Nieudana próba aktualizacji profilu użytkownika '{user.UserName}'.", 
                user.UserName, 
                user.Id,
                "Warning");

            return BadRequest(result.Errors);
        }
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

            if (result.Succeeded)
            {
                await _logService.LogAsync("PASSWORD_CHANGE_SUCCESS", $"Użytkownik {user.UserName} zmienił hasło.", user.UserName, user.Id, "Success");
                return Ok(new { Message = "Hasło zostało pomyślnie zmienione." });
            }

            await _logService.LogAsync("PASSWORD_CHANGE_FAILED", $"Nieudana zmiana hasła dla {user.UserName}.", user.UserName, user.Id, "Security");

            return BadRequest(result.Errors);
        }
    }
}