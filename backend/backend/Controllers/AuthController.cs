using backend.Data;
using backend.Models;
using backend.DTOs; 
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers;
[ApiController] 
[Route("api/auth")] 
public class AuthController : ControllerBase
{
        
    private readonly UserManager<ApplicationUser> _userManager; 
    private readonly RoleManager<IdentityRole> _roleManager; 
    private readonly IConfiguration _configuration;
    
    public AuthController(
        UserManager<ApplicationUser> userManager, 
        RoleManager<IdentityRole> roleManager, 
        IConfiguration configuration)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
    }
        
    [HttpPost("register")] 
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var userExists = await _userManager.FindByEmailAsync(registerDto.Email);
        if (userExists != null)
        {
            return BadRequest(new { Message = "Użytkownik o tym adresie e-mail już istnieje." });
        }

        var newUser = new ApplicationUser
        {
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Email = registerDto.Email,
            UserName = registerDto.Email, 
            EmailConfirmed = true 
        };
        var result = await _userManager.CreateAsync(newUser, registerDto.Password);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }
        
        await _userManager.AddToRoleAsync(newUser, "User");

        return Ok(new { Message = "Użytkownik pomyślnie zarejestrowany." });
    }
    
     [HttpPost("login")] 
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                return Unauthorized(new { Message = "Niepoprawny adres e-mail lub hasło." });
            }

            var userRoles = await _userManager.GetRolesAsync(user);

            var tokenString = GenerateJwtToken(user, userRoles);

            return Ok(new
            {
                Message = "Zalogowano pomyślnie",
                Token = tokenString,
                User = new { user.Email, user.FirstName, user.LastName }
            });
        }
        
        
        private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email), 
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), 
                new Claim(ClaimTypes.NameIdentifier, user.Id), 
                new Claim("firstName", user.FirstName) 
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expires = DateTime.Now.AddDays(1);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
}