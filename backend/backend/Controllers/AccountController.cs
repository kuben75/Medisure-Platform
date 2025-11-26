using backend.DTOs;
using backend.Models;
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

        public AccountController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
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
            
            if (user.Email != updateDto.Email)
            {
                var emailExists = await _userManager.FindByEmailAsync(updateDto.Email);
                if (emailExists != null && emailExists.Id != user.Id)
                {
                    return BadRequest(new { Message = "Ten adres e-mail jest już zajęty." });
                }
                user.Email = updateDto.Email;
            }

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { 
                    email = user.Email, 
                    firstName = user.FirstName, 
                    lastName = user.LastName,
                    phoneNumber = user.PhoneNumber 
                });
            }

            return BadRequest(result.Errors);
        }
    }
}