using backend.Models;
using backend.DTOs;
using backend.Data;
using backend.Services;
using backend.Services.Interfaces;
using backend.Helpers; 
using backend.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Net;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly ILogService _logService;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly ITokenService _tokenService; 
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        ILogService logService,
        IEmailService emailService,
        INotificationService notificationService,
        ITokenService tokenService, 
        ApplicationDbContext context,
        IMemoryCache cache)
    {
        _userManager = userManager;
        _configuration = configuration;
        _logService = logService;
        _emailService = emailService;
        _notificationService = notificationService;
        _tokenService = tokenService;
        _context = context;
        _cache = cache;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        if (await _userManager.FindByEmailAsync(registerDto.Email) != null)
        {
            await SafeLogAsync("NIEUDANA_REJESTRACJA", $"Próba rejestracji na zajęty email: {registerDto.Email}", "System", null, "Warning");
            return BadRequest(new ErrorResponse 
            { 
                Success = false, 
                Message = "Użytkownik o tym adresie e-mail już istnieje.",
                ErrorCode = (int)ErrorCode.ValidationError 
            });
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
            var errorMsg = string.Join(", ", result.Errors.Select(e => e.Description));
            
            return BadRequest(new ErrorResponse 
            { 
                Success = false, 
                Message = errorMsg, 
                ErrorCode = (int)ErrorCode.ValidationError 
            });
        }

        var roleResult = await _userManager.AddToRoleAsync(newUser, "User");
        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(newUser); 
            await SafeLogAsync("BLAD_SYSTEMU", $"Nie udało się nadać roli User dla {registerDto.Email}", "System", null, "Error");
            return StatusCode(500, new ErrorResponse { Message = "Błąd systemu podczas rejestracji.", ErrorCode = (int)ErrorCode.InternalServerError });
        }
        
        await SafeLogAsync("UDANA_REJESTRACJA", $"Zarejestrowano: {registerDto.Email}", newUser.UserName, newUser.Id, "Success");

        await _notificationService.CreateNotificationAsync(
            newUser.Id,
            "Witamy w Medisure!",
            "Dziękujemy za dołączenie do Medisure. Cieszymy się, że jesteś z nami!",
            "Informacja"
        );

        await SendConfirmationEmailAsync(newUser);

        return Ok(new { Message = "Konto utworzone. Sprawdź e-mail, aby je aktywować!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null)
        {
            await LogFailedLoginAttempt(loginDto.Email, "nieznany email");
            return Unauthorized(new ErrorResponse 
            { 
                Success = false, 
                Message = "Niepoprawny adres e-mail lub hasło.", 
                ErrorCode = (int)ErrorCode.InvalidCredentials 
            });
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            return StatusCode(403, new ErrorResponse 
            { 
                Success = false, 
                Message = "Twoje konto zostało zablokowane.", 
                ErrorCode = (int)ErrorCode.AccountLocked 
            });
        }


        if (!await _userManager.CheckPasswordAsync(user, loginDto.Password))
        {
            await _userManager.AccessFailedAsync(user);
            await LogFailedLoginAttempt(loginDto.Email, "błędne hasło", user.Id, await _userManager.IsLockedOutAsync(user));
            return Unauthorized(new ErrorResponse 
            { 
                Success = false, 
                Message = "Niepoprawny adres e-mail lub hasło.", 
                ErrorCode = (int)ErrorCode.InvalidCredentials 
            });
        }

        await _userManager.ResetAccessFailedCountAsync(user);

        if (!user.EmailConfirmed)
        {
            await SafeLogAsync("LOGOWANIE_ZABLOKOWANE", $"Logowanie na nieaktywne konto: {loginDto.Email}", user.UserName, user.Id, "Warning");
            return Unauthorized(new ErrorResponse 
            { 
                Success = false, 
                Message = "Konto nie jest aktywne. Potwierdź adres e-mail.",
                ErrorCode = (int)ErrorCode.AccountNotActive 
            });
        }

        if (await _userManager.GetTwoFactorEnabledAsync(user))
        {
            return Ok(new { Message = "Wymagana weryfikacja dwuetapowa.", Code = "REQUIRES_2FA", Email = user.Email });
        }


        await CheckAndNotifyExpiringPackages(user);

        var tokenString = _tokenService.GenerateJwtToken(user, await _userManager.GetRolesAsync(user));
        
        await SafeLogAsync("UDANE_LOGOWANIE", $"Zalogowano: {loginDto.Email}", user.UserName, user.Id, "Success");

        return Ok(new
        {
            Message = "Zalogowano pomyślnie",
            Token = tokenString,
            User = new { user.Email, user.FirstName, user.LastName, user.BirthDate, user.Pesel }
        });
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(string userId, string token)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
            return BadRequest(new { Message = "Błędny link weryfikacyjny." });

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return BadRequest(new ErrorResponse { Message = "Użytkownik nie istnieje.", ErrorCode = (int)ErrorCode.NotFound });

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (result.Succeeded)
        {
            await SafeLogAsync("EMAIL_POTWIERDZONY", $"Użytkownik {user.Email} potwierdził email.", user.Email, user.Id, "Success");
            return Ok(new { Message = "Email został potwierdzony pomyślnie." });
        }

        return BadRequest(new ErrorResponse { Message = "Link wygasł lub jest nieprawidłowy.", ErrorCode = (int)ErrorCode.ValidationError });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        string cacheKey = $"reset_password_cooldown_{dto.Email.ToLower()}";
        if (_cache.TryGetValue(cacheKey, out _))
            return Ok(new { Message = "Jeśli konto istnieje, wysłaliśmy link resetujący." });

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
        {
            await Task.Delay(new Random().Next(100, 300));
            return Ok(new { Message = "Jeśli konto istnieje, wysłaliśmy link resetujący." });
        }

        
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebUtility.UrlEncode(token);
            var resetLink = $"{_configuration["FrontendUrl"]}/reset-hasla?token={encodedToken}&email={dto.Email}";

            await SendHtmlEmailAsync(
                user.Email, "Reset hasła - Medisure", "Resetowanie hasła",
                "Otrzymaliśmy prośbę o zmianę hasła. Jeśli to nie Ty, zignoruj tę wiadomość.",
                "Zmień hasło", resetLink
            );

            await SafeLogAsync("RESET_HASLA", $"Żądanie resetu: {dto.Email}", "System", null, "Security");
            _cache.Set(cacheKey, true, TimeSpan.FromMinutes(5));

            return Ok(new { Message = "Jeśli konto istnieje, wysłaliśmy link resetujący." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return Ok(new { Message = "Hasło zostało zmienione." });

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (result.Succeeded)
        {
            await _userManager.ResetAccessFailedCountAsync(user);
            await _userManager.UpdateSecurityStampAsync(user);

            await SafeLogAsync("RESET_HASLA", $"Hasło zmienione: {dto.Email}", "System", null, "Success");
            return Ok(new { Message = "Hasło zostało zmienione pomyślnie." });
        }

        return BadRequest(new ErrorResponse 
        { 
            Message = "Nie udało się zresetować hasła. Link może być nieaktywny.", 
            ErrorCode = (int)ErrorCode.ValidationError 
        });
    }

    [HttpGet("verify-reset-token")]
    public async Task<IActionResult> VerifyResetToken(string email, string token)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
            return BadRequest(new ErrorResponse { Message = "Brak danych.", ErrorCode = (int)ErrorCode.ValidationError });

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return BadRequest(new ErrorResponse { Message = "Link nieaktywny.", ErrorCode = (int)ErrorCode.NotFound });

        var isValid = await _userManager.VerifyUserTokenAsync(user, _userManager.Options.Tokens.PasswordResetTokenProvider, "ResetPassword", token);
        
        return isValid 
            ? Ok(new { Message = "Token aktywny." }) 
            : BadRequest(new ErrorResponse { Message = "Link nieaktywny lub wygasł.", ErrorCode = (int)ErrorCode.ValidationError });
    }

    [HttpPost("login-2fa")]
    public async Task<IActionResult> Verify2FaCode([FromBody] TwoFactorLoginDto dto)
    {
        
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return Unauthorized(new ErrorResponse { Message = "Błąd autoryzacji.", ErrorCode = (int)ErrorCode.InvalidCredentials });
        
        if (!string.IsNullOrEmpty(dto.Password)) 
        {
            if (!await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                await SafeLogAsync("LOGOWANIE_2FA_FAIL", "Błędne hasło przy 2FA", user.Email, user.Id, "Warning");
                return Unauthorized(new ErrorResponse { Message = "Błędne hasło.", ErrorCode = (int)ErrorCode.InvalidCredentials });
            }
        }
        else
        {
            return BadRequest(new ErrorResponse { Message = "Wymagane hasło.", ErrorCode = (int)ErrorCode.ValidationError });
        }
        
        var isCodeValid = await _userManager.VerifyTwoFactorTokenAsync(
            user, 
            _userManager.Options.Tokens.AuthenticatorTokenProvider, 
            dto.Code.Replace(" ", string.Empty).Replace("-", "")
        );

        if (!isCodeValid)
        {
            await SafeLogAsync("LOGOWANIE_2FA", $"Niepoprawny kod 2FA: {dto.Email}", user.Email, user.Id, "Security");
            return BadRequest(new ErrorResponse 
            { 
                Success = false, 
                Message = "Niepoprawny kod weryfikacyjny.", 
                ErrorCode = (int)ErrorCode.InvalidTwoFactorCode 
            });
        }

        var tokenString = _tokenService.GenerateJwtToken(user, await _userManager.GetRolesAsync(user));
        
        await SafeLogAsync("LOGOWANIE_2FA", $"Zalogowano z 2FA: {dto.Email}", user.UserName, user.Id, "Success");

        return Ok(new { 
            Message = "Zalogowano pomyślnie", 
            Token = tokenString, 
            User = new { user.Email, user.FirstName, user.LastName, user.BirthDate, user.Pesel, user.TwoFactorEnabled } 
        });
    }

    [HttpGet("confirm-new-email")]
    public async Task<IActionResult> ConfirmNewEmail(string userId, string newEmail, string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return BadRequest(new ErrorResponse { Message = "Użytkownik nie istnieje.", ErrorCode = (int)ErrorCode.NotFound });

        if (await _userManager.FindByNameAsync(newEmail) != null)
        {
            return BadRequest(new ErrorResponse { Message = "Ten email jest już zajęty przez inne konto.", ErrorCode = (int)ErrorCode.ValidationError });
        }

        var result = await _userManager.ChangeEmailAsync(user, newEmail, token);
        if (result.Succeeded)
        {
            await _userManager.SetUserNameAsync(user, newEmail);
            await _userManager.UpdateSecurityStampAsync(user);
            await _logService.LogAsync("ZMIANA_EMAIL", $"Użytkownik zmienił email na {newEmail}", newEmail, user.Id, "Info");
            return Ok(new { Message = "Email zmieniony pomyślnie." });
        }
        return BadRequest(new ErrorResponse { Message = "Link wygasł lub jest nieprawidłowy.", ErrorCode = (int)ErrorCode.ValidationError });
    }


    private async Task CheckAndNotifyExpiringPackages(ApplicationUser user)
    {
        if (user == null) return;
        
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
                    $"Twój pakiet '{sub.Package.Name}' wygasa za {daysLeft} dni. Odnów go.",
                    "Ostrzeżenie"
                );
            }
        }
    }

    private async Task SendConfirmationEmailAsync(ApplicationUser user)
    {
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebUtility.UrlEncode(token);
        var confirmLink = $"{_configuration["FrontendUrl"]}/potwierdz-email?userId={user.Id}&token={encodedToken}";

        await SendHtmlEmailAsync(
            user.Email, "Potwierdź swoje konto - Medisure", $"Witaj, {user.FirstName}!",
            "Aby aktywować konto, kliknij w poniższy przycisk.", "Aktywuj konto", confirmLink
        );
    }

    private async Task LogFailedLoginAttempt(string email, string reason, string userId = null, bool isLocked = false)
    {
        var clientIp = GetClientIpAddress();
        var action = isLocked ? "BLOKADA_KONTA" : "NIEUDANE_LOGOWANIE";
        var desc = isLocked 
            ? $"Konto zablokowane (Brute Force?). IP: {clientIp}" 
            : $"{reason}: {email}. IP: {clientIp}";
        var level = isLocked ? "Error" : "Warning";

        await _logService.LogAsync(action, desc, "System", userId, level, isSensitive: true);
    }

    private string GetClientIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For")) return Request.Headers["X-Forwarded-For"].ToString();
        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "Nieznany IP";
    }

    private async Task SafeLogAsync(string action, string desc, string user, string userId = null, string level = "Info")
    {
        try { await _logService.LogAsync(action, desc, user, userId, level); }
        catch (Exception ex) { Console.WriteLine($"LOGGING ERROR: {ex.Message}"); }
    }

    private async Task SendHtmlEmailAsync(string to, string subject, string title, string message, string buttonText, string buttonLink)
    {
        var htmlBody = EmailTemplates.GetBaseTemplate(title, message, buttonText, buttonLink);
        await _emailService.SendEmailAsync(to, subject, htmlBody);
    }
}