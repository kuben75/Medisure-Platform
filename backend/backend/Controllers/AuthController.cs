using backend.Models;
using backend.DTOs; 
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using backend.Services;
using System.Net; 

namespace backend.Controllers
{
    [ApiController] 
    [Route("api/auth")] 
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager; 
        private readonly RoleManager<IdentityRole> _roleManager; 
        private readonly IConfiguration _configuration;
        private readonly ILogService _logService;
        private readonly IEmailService _emailService; 
        
        public AuthController(
            UserManager<ApplicationUser> userManager, 
            RoleManager<IdentityRole> roleManager, 
            IConfiguration configuration,
            ILogService logService,
            IEmailService emailService) 
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _logService = logService;
            _emailService = emailService;
        }

        private async Task SendHtmlEmailAsync(string to, string subject, string title, string message, string buttonText, string buttonLink)
        {
            var htmlBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;'>
                    <div style='text-align: center; margin-bottom: 30px;'>
                        <h2 style='color: #4E61F6; margin: 0;'>Medisure.pl</h2>
                    </div>
                    <div style='padding: 20px; background-color: #fafafa; border-radius: 8px;'>
                        <h1 style='color: #333; font-size: 24px; margin-bottom: 20px;'>{title}</h1>
                        <p style='color: #555; line-height: 1.6; font-size: 16px;'>{message}</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{buttonLink}' style='background-color: #4E61F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;'>{buttonText}</a>
                        </div>
                        <p style='color: #999; font-size: 12px; margin-top: 30px;'>Jeśli przycisk nie działa, skopiuj poniższy link do przeglądarki:<br/>{buttonLink}</p>
                    </div>
                    <div style='text-align: center; margin-top: 20px; color: #aaa; font-size: 12px;'>
                        &copy; {DateTime.Now.Year} Medisure Sp. z o.o. Wszystkie prawa zastrzeżone.
                    </div>
                </div>
            ";
            await _emailService.SendEmailAsync(to, subject, htmlBody);
        }

        private async Task SafeLogAsync(string action, string desc, string user, string userId = null, string level = "Info")
        {
            try { await _logService.LogAsync(action, desc, user, userId, level); }
            catch (Exception ex) { Console.WriteLine($"LOGGING ERROR: {ex.Message}"); }
        }
            
        [HttpPost("register")] 
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var userExists = await _userManager.FindByEmailAsync(registerDto.Email);
            if (userExists != null)
            {
                await SafeLogAsync("REGISTER_FAILED", $"Próba rejestracji zajęty email: {registerDto.Email}", "System", null, "Warning");
                return BadRequest(new { Message = "Użytkownik o tym adresie e-mail już istnieje." });
            }

            var newUser = new ApplicationUser
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                UserName = registerDto.Email, 
                EmailConfirmed = false 
            };

            var result = await _userManager.CreateAsync(newUser, registerDto.Password);

            if (!result.Succeeded)
            {
                await SafeLogAsync("REGISTER_FAILED", $"Błąd rejestracji: {registerDto.Email}", "System", null, "Warning");
                return BadRequest(result.Errors);
            }
            
            await _userManager.AddToRoleAsync(newUser, "User");
            await SafeLogAsync("REGISTER_SUCCESS", $"Zarejestrowano: {registerDto.Email}", newUser.UserName, newUser.Id, "Success");

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(newUser);
            var encodedToken = WebUtility.UrlEncode(token);
            // REACT
            // var confirmLink = $"http://localhost:5173/potwierdz-email?userId={newUser.Id}&token={encodedToken}";
            //DOCKER
            var confirmLink = $"http://localhost:8080/potwierdz-email?userId={newUser.Id}&token={encodedToken}";

            await SendHtmlEmailAsync(
                newUser.Email, 
                "Potwierdź swoje konto - Medisure",
                $"Witaj, {newUser.FirstName}!",
                "Dziękujemy za dołączenie do Medisure. Aby aktywować swoje konto i uzyskać dostęp do wszystkich funkcji, kliknij w poniższy przycisk.",
                "Aktywuj konto",
                confirmLink
            );

            return Ok(new { Message = "Konto utworzone. Sprawdź e-mail, aby je aktywować!" });
        }
        
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
                return BadRequest(new { Message = "Błędny link weryfikacyjny." });

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return BadRequest(new { Message = "Użytkownik nie istnieje." });

            var result = await _userManager.ConfirmEmailAsync(user, token);
            
            if (result.Succeeded)
            {
                await SafeLogAsync("EMAIL_CONFIRMED", $"Użytkownik {user.Email} potwierdził email.", user.Email, user.Id, "Success");
                return Ok(new { Message = "Email został potwierdzony pomyślnie." });
            }

            return BadRequest(new { Message = "Link wygasł lub jest nieprawidłowy." });
        }

        [HttpPost("login")] 
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                await SafeLogAsync("LOGIN_FAILED", $"Błąd logowania: {loginDto.Email}", "System", null, "Security");
                return Unauthorized(new { Message = "Niepoprawny adres e-mail lub hasło." });
            }

            if (!user.EmailConfirmed)
            {
                await SafeLogAsync("LOGIN_BLOCKED", $"Logowanie na nieaktywne konto: {loginDto.Email}", user.UserName, user.Id, "Warning");
                return Unauthorized(new { Message = "Konto nie jest aktywne. Sprawdź skrzynkę e-mail i kliknij link aktywacyjny." });
            }

            var userRoles = await _userManager.GetRolesAsync(user);
            var tokenString = GenerateJwtToken(user, userRoles);
            
            await SafeLogAsync("LOGIN_SUCCESS", $"Zalogowano: {loginDto.Email}", user.UserName, user.Id, "Success");
            
            return Ok(new
            {
                Message = "Zalogowano pomyślnie",
                Token = tokenString,
                User = new { user.Email, user.FirstName, user.LastName, user.BirthDate, user.Pesel }
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) 
                return Ok(new { Message = "Jeśli konto istnieje, wysłaliśmy link resetujący." });
            
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebUtility.UrlEncode(token);
            //REACT
            // var resetLink = $"http://localhost:5173/reset-hasla?token={encodedToken}&email={dto.Email}";
            //DOCKER
            var resetLink = $"http://localhost:8080/reset-hasla?token={encodedToken}&email={dto.Email}";

            await SendHtmlEmailAsync(
                user.Email,
                "Reset hasła - Medisure",
                "Resetowanie hasła",
                "Otrzymaliśmy prośbę o zmianę hasła do Twojego konta. Jeśli to nie Ty, zignoruj tę wiadomość.",
                "Zmień hasło",
                resetLink
            );

            await SafeLogAsync("PASSWORD_RESET_REQUEST", $"Żądanie resetu: {dto.Email}", "System", null, "Security");
            return Ok(new { Message = "Jeśli konto istnieje, wysłaliśmy link resetujący." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return BadRequest(new { Message = "Błąd resetowania hasła." });

            var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
            
            if (result.Succeeded)
            {
                await SafeLogAsync("PASSWORD_RESET_SUCCESS", $"Hasło zmienione: {dto.Email}", "System", null, "Success");
                return Ok(new { Message = "Hasło zostało zmienione pomyślnie." });
            }

            return BadRequest(new { Message = "Link wygasł lub jest nieprawidłowy." });
        }
        
        private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id), 
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), 
                new Claim(ClaimTypes.NameIdentifier, user.Id), 
                new Claim("firstName", user.FirstName),
                new Claim(ClaimTypes.Name, user.Email) // Ważne dla logów!
            };

            foreach (var role in roles) claims.Add(new Claim(ClaimTypes.Role, role));

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
}