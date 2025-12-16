using backend.Models;
using backend.DTOs;
using backend.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using backend.Services;
using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly ILogService _logService;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration,
        ILogService logService,
        IEmailService emailService,
        INotificationService notificationService,
        ApplicationDbContext context,
        IMemoryCache cache)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _logService = logService;
        _emailService = emailService;
        _notificationService = notificationService;
        _context = context;
        _cache = cache;
    }

    private string GetClientIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For")) return Request.Headers["X-Forwarded-For"].ToString();
        
        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "Unknown";
    }

    private async Task SendHtmlEmailAsync(string to, string subject, string title, string message, string buttonText,
        string buttonLink)
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

    private async Task SafeLogAsync(string action, string desc, string user, string userId = null,
        string level = "Info")
    {
        try 
        {
            await _logService.LogAsync(action, desc, user, userId, level);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"LOGGING ERROR: {ex.Message}");
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var userExists = await _userManager.FindByEmailAsync(registerDto.Email);
        if (userExists != null)
        {
            await SafeLogAsync("NIEUDANA_REJESTRACJA", $"Próba rejestracji zajęty email: {registerDto.Email}", "System",
                null, "Warning");
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
            await SafeLogAsync("NIEUDANA_REJESTRACJA", $"Błąd rejestracji: {registerDto.Email}", "System", null, "Warning");
            return BadRequest(result.Errors);
        }

        await _userManager.AddToRoleAsync(newUser, "User");
        await SafeLogAsync("UDANA_REJESTRACJA", $"Zarejestrowano: {registerDto.Email}", newUser.UserName, newUser.Id,
            "Success");
        await _notificationService.CreateNotificationAsync(
            newUser.Id,
            "Witamy w Medisure!",
            "Dziękujemy za dołączenie do Medisure. Cieszymy się, że jesteś z nami! Zapoznaj się z regulaminem i zacznij korzystać z naszych usług. Jeśli masz pytania, skontaktuj się z naszym zespołem wsparcia.",
            "Informacja"
        );
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(newUser);
        var encodedToken = WebUtility.UrlEncode(token);
        
        var frontendUrl = _configuration["FrontendUrl"]; 
        var confirmLink = $"{frontendUrl}/potwierdz-email?userId={newUser.Id}&token={encodedToken}";


        await SendHtmlEmailAsync(
            newUser.Email,
            "Potwierdź swoje konto - Medisure",
            $"Witaj, {newUser.FirstName}!",
            "Dziękujemy za dołączenie do Medisure. Aby aktywować swoje konto i uzyskać dostęp do wszystkich funkcji, kliknij w poniższy przycisk. Link będzie ważny przez 24 godziny.",
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
            await SafeLogAsync("EMAIL_POTWIERDZONY", $"Użytkownik {user.Email} potwierdził email.", user.Email, user.Id,
                "Success");
            return Ok(new { Message = "Email został potwierdzony pomyślnie." });
        }

        return BadRequest(new { Message = "Link wygasł lub jest nieprawidłowy." });
    }

    [HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
{
    var user = await _userManager.FindByEmailAsync(loginDto.Email);

    if (user == null)
    {
        var clientIp = GetClientIpAddress();
        await _logService.LogAsync(
            "NIEUDANE_LOGOWANIE", 
            $"Nieudana próba logowania (nieznany email): {loginDto.Email}. IP: {clientIp}", 
            "System", 
            null, 
            "Warning", 
            isSensitive: true 
        );
        return Unauthorized(new { Message = "Niepoprawny adres e-mail lub hasło." });
    }

    if (await _userManager.IsLockedOutAsync(user))
    {
        return Unauthorized(new { 
            Message = "Twoje konto zostało zablokowane. Szczegóły oraz powód blokady zostały wysłane na Twój adres e-mail.", 
            Code = "ACCOUNT_LOCKED" 
        });
    }

    if (!await _userManager.CheckPasswordAsync(user, loginDto.Password))
    {
        await _userManager.AccessFailedAsync(user);

        if (await _userManager.IsLockedOutAsync(user))
        {
            var clientIp = GetClientIpAddress();
        
            await _logService.LogAsync(
                "BLOKADA_KONTA", 
                $"Konto {user.Email} zostało zablokowane przez system (Brute Force?). IP: {clientIp}", 
                "System", 
                user.Id, 
                "Error", 
                isSensitive: true
            );
        }
        else 
        {
            var clientIp = GetClientIpAddress();
            await _logService.LogAsync(
                "NIEUDANE_LOGOWANIE", 
                $"Błędne hasło: {loginDto.Email}. IP: {clientIp}", 
                "System", 
                user.Id, 
                "Warning", 
                isSensitive: true
            );
        }

        return Unauthorized(new { Message = "Niepoprawny adres e-mail lub hasło." });
    }

    await _userManager.ResetAccessFailedCountAsync(user);

    if (!user.EmailConfirmed)
    {
        await SafeLogAsync("LOGOWANIE_ZABLOKOWANE", $"Logowanie na nieaktywne konto: {loginDto.Email}", user.UserName, user.Id, "Warning");
        return Unauthorized(new { Message = "Konto nie jest aktywne. Sprawdź skrzynkę e-mail i kliknij link aktywacyjny." });
    }

    if (await _userManager.GetTwoFactorEnabledAsync(user))
    {
        return Ok(new { Message = "Wymagana weryfikacja dwuetapowa.", Code = "REQUIRES_2FA", Email = user.Email });
    }

    var expiringPackages = await _context.UserPackages
        .Include(p => p.Package)
        .Where(up => up.UserId == user.Id && up.Status == "Active")
        .Where(up => up.EndDate > DateTime.UtcNow && up.EndDate < DateTime.UtcNow.AddDays(7))
        .ToListAsync();

    foreach (var sub in expiringPackages)
    {
        var daysLeft = (sub.EndDate - DateTime.UtcNow).Days;
        var notifiedRecently = await _context.SystemNotifications
            .AnyAsync(n => n.UserId == user.Id && n.Message.Contains(sub.Package.Name) && n.CreatedAt > DateTime.UtcNow.AddDays(-3));

        if (!notifiedRecently)
        {
            await _notificationService.CreateNotificationAsync(
                user.Id,
                "Pakiet wkrótce wygaśnie",
                $"Twój pakiet '{sub.Package.Name}' wygasa za {daysLeft} dni. Odnów go, aby zachować ciągłość ochrony.",
                "Ostrzeżenie"
            );
        }
    }

    var userRoles = await _userManager.GetRolesAsync(user);
    var tokenString = GenerateJwtToken(user, userRoles);

    await SafeLogAsync("UDANE_LOGOWANIE", $"Zalogowano: {loginDto.Email}", user.UserName, user.Id, "Success");
    
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
        string cacheKey = $"reset_password_cooldown_{dto.Email.ToLower()}";
        if (_cache.TryGetValue(cacheKey, out _))
        {
            return Ok(new { Message = "Jeśli konto istnieje, wysłaliśmy link resetujący." });
        }
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return Ok(new { Message = "Jeśli konto istnieje, wysłaliśmy link resetujący." });
        try
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebUtility.UrlEncode(token);
            var frontendUrl = _configuration["FrontendUrl"];
            var resetLink = $"{frontendUrl}/reset-hasla?token={encodedToken}&email={dto.Email}";

            await SendHtmlEmailAsync(
                user.Email,
                "Reset hasła - Medisure",
                "Resetowanie hasła",
                "Otrzymaliśmy prośbę o zmianę hasła do Twojego konta. Jeśli to nie Ty, zignoruj tę wiadomość.",
                "Zmień hasło",
                resetLink
            );

            await SafeLogAsync("RESET_HASLA", $"Żądanie resetu: {dto.Email}", "System", null, "Security");
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(5)); 

            _cache.Set(cacheKey, true, cacheOptions);
        }
        catch (Exception ex)
        {
            await SafeLogAsync("EMAIL_FAILED", $"Błąd wysyłki resetu hasła: {ex.Message}", "System", null, "Error");
            
            return StatusCode(500, new { Message = "Wystąpił błąd podczas wysyłania e-maila. Spróbuj ponownie później." });
        }
        return Ok(new { Message = "Jeśli konto istnieje, wysłaliśmy link resetujący." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return Ok(new { Message = "Hasło zostało zmienione." });
        

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);

        if (result.Succeeded)
        {
            await SafeLogAsync("RESET_HASLA", $"Hasło zmienione: {dto.Email}", "System", null, "Success");
            return Ok(new { Message = "Hasło zostało zmienione pomyślnie." });
        }

        return BadRequest(new { Message = "Nie udało się zresetować hasła.", Errors = result.Errors });
    }

    private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("firstName", user.FirstName)
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
    
    [HttpGet("verify-reset-token")]
    public async Task<IActionResult> VerifyResetToken(string email, string token)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
            return BadRequest(new { Message = "Nieprawidłowy link (brak danych)." });
        

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return BadRequest(new { Message = "Nieprawidłowy link (użytkownik nie istnieje)." });
        
        var tokenProvider = _userManager.Options.Tokens.PasswordResetTokenProvider;
        
        var isValid = await _userManager.VerifyUserTokenAsync(user, tokenProvider, "ResetPassword", token);

        if (isValid)
            return Ok(new { Message = "Token jest aktywny." });
        
            
        return BadRequest(new { Message = "Link wygasł lub został już wykorzystany." });
    }
    
    [HttpPost("login-2fa")]
    public async Task<IActionResult> Verify2FaCode([FromBody] TwoFactorLoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return Unauthorized(new { Message = "Błąd autoryzacji." });

        var isCodeValid = await _userManager.VerifyTwoFactorTokenAsync(
            user, 
            _userManager.Options.Tokens.AuthenticatorTokenProvider, 
            dto.Code.Replace(" ", string.Empty)); 

        if (!isCodeValid)
        {
            await SafeLogAsync("LOGOWANIE_2FA", $"Niepoprawny kod 2FA dla {dto.Email}", user.Email, user.Id, "Security");
            return Unauthorized(new { Message = "Niepoprawny kod weryfikacyjny." });
        }

        var userRoles = await _userManager.GetRolesAsync(user);
        var tokenString = GenerateJwtToken(user, userRoles);

        await SafeLogAsync("LOGOWANIE_2FA", $"Zalogowano z 2FA: {dto.Email}", user.UserName, user.Id, "Success");

        return Ok(new
        {
            Message = "Zalogowano pomyślnie",
            Token = tokenString,
            User = new { user.Email, user.FirstName, user.LastName, user.BirthDate, user.Pesel, user.TwoFactorEnabled }
        });
    }
    [HttpGet("confirm-new-email")]
    public async Task<IActionResult> ConfirmNewEmail(string userId, string newEmail, string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return BadRequest(new { Message = "Użytkownik nie istnieje." });

        var result = await _userManager.ChangeEmailAsync(user, newEmail, token);

        if (result.Succeeded)
        {
            await _userManager.SetUserNameAsync(user, newEmail);
            await _userManager.UpdateSecurityStampAsync(user);
            await _logService.LogAsync("ZMIANA_EMAIL", $"Użytkownik zmienił email na {newEmail}", newEmail, user.Id, "Info");
            return Ok(new { Message = "Adres e-mail został pomyślnie zmieniony." });
        }

        return BadRequest(new { Message = "Link jest nieprawidłowy lub wygasł." });
    }
    
}