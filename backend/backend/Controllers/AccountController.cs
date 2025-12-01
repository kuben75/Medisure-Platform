using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/account")]
    [Authorize] 
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogService _logService;

        public AccountController(UserManager<ApplicationUser> userManager, ILogService logService)
        {
            _userManager = userManager;
            _logService = logService;
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
                    birthDate = user.BirthDate
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
    }
}