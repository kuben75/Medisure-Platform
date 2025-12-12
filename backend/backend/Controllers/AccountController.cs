using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.Data;
using System.Text.Encodings.Web;
using System.Net;

namespace backend.Controllers;

[ApiController]
[Route("api/account")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogService _logService;
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly UrlEncoder _urlEncoder;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AccountController(
        UserManager<ApplicationUser> userManager,
        ILogService logService, ApplicationDbContext context,
        INotificationService notificationService,
        UrlEncoder urlEncoder,
        IEmailService emailService,
        IConfiguration configuration
    )
    {
        _userManager = userManager;
        _logService = logService;
        _context = context;
        _notificationService = notificationService;
        _urlEncoder = urlEncoder;
        _emailService = emailService;
        _configuration = configuration;
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserDto updateDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId == null) return Unauthorized();

    var user = await _userManager.FindByIdAsync(userId);
    if (user == null) return Unauthorized();

    bool isEmailChangeRequest = !string.Equals(user.Email, updateDto.Email, StringComparison.OrdinalIgnoreCase);
    
    if (isEmailChangeRequest)
    {
        if (string.IsNullOrEmpty(updateDto.CurrentPassword))
            return BadRequest(new { Message = "Aby zmienić adres e-mail, musisz podać aktualne hasło." });

        if (!await _userManager.CheckPasswordAsync(user, updateDto.CurrentPassword))
        {
            await _logService.LogAsync("SECURITY_FAIL", "Błędne hasło (zmiana email)", user.UserName, user.Id, "Warning");
            return BadRequest(new { Message = "Podane hasło jest nieprawidłowe." });
        }

        if (user.TwoFactorEnabled)
        {
            if (string.IsNullOrWhiteSpace(updateDto.TwoFactorCode))
            {
                return BadRequest(new { Message = "Wymagany kod z aplikacji uwierzytelniającej." });
            }

            var cleanCode = updateDto.TwoFactorCode.Replace(" ", "").Replace("-", "");

            var is2faValid = await _userManager.VerifyTwoFactorTokenAsync(
                user, 
                _userManager.Options.Tokens.AuthenticatorTokenProvider, 
                cleanCode);

            if (!is2faValid)
            {
                await _logService.LogAsync("SECURITY_FAIL", "Błędny kod 2FA (zmiana email)", user.UserName, user.Id, "Warning");
                return BadRequest(new { Message = "Nieprawidłowy kod weryfikacyjny 2FA." });
            }
        }

        if (await _userManager.FindByEmailAsync(updateDto.Email) != null)
            return BadRequest(new { Message = "Ten adres e-mail jest już zajęty." });
    }

    user.FirstName = updateDto.FirstName;
    user.LastName = updateDto.LastName;
    user.PhoneNumber = updateDto.PhoneNumber;

    if (updateDto.BirthDate.HasValue)
    {
        var today = DateTime.UtcNow.Date;
        var birthDate = updateDto.BirthDate.Value.Date;
        var age = today.Year - birthDate.Year;
        if (birthDate > today.AddYears(-age)) age--;

        if (age < 18) return BadRequest(new { Message = "Musisz mieć ukończone 18 lat." });
        if (age > 99) return BadRequest(new { Message = "Nieprawidłowa data urodzenia." });

        user.BirthDate = DateTime.SpecifyKind(updateDto.BirthDate.Value, DateTimeKind.Utc);
    }
    
    var updateResult = await _userManager.UpdateAsync(user);
    if (!updateResult.Succeeded) 
    {
        await _logService.LogAsync("UPDATE_PROFILE_FAILED", $"Błąd DB: {string.Join(", ", updateResult.Errors.Select(e => e.Description))}", user.UserName, user.Id, "Error");
        return BadRequest(updateResult.Errors);
    }

        if (isEmailChangeRequest)
        {
            
            var token = await _userManager.GenerateChangeEmailTokenAsync(user, updateDto.Email);
                var encodedToken = WebUtility.UrlEncode(token);

                var frontendUrl = _configuration["FrontendUrl"];

                var confirmLink =
                    $"{frontendUrl}/potwierdz-nowy-email?userId={user.Id}&newEmail={updateDto.Email}&token={encodedToken}";

                var emailBodyNew = $@"
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;'>
        <div style='background-color: #4E61F6; padding: 30px; text-align: center;'>
            <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Potwierdź zmianę e-maila</h1>
        </div>
        <div style='padding: 30px; text-align: center;'>
            <p style='color: #333; font-size: 16px; margin-bottom: 20px;'>
                Cześć <strong>{user.FirstName}</strong>,<br>
                Otrzymaliśmy prośbę o zmianę adresu e-mail powiązanego z Twoim kontem Medisure.
            </p>
            <p style='color: #555; font-size: 14px; margin-bottom: 30px;'>
                Aby potwierdzić nowy adres <strong>{updateDto.Email}</strong>, kliknij poniższy przycisk:
            </p>
            <a href='{confirmLink}' style='background-color: #4E61F6; color: white; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;'>Potwierdź zmianę</a>
            <p style='color: #999; font-size: 12px; margin-top: 30px;'>
                Jeśli to nie Ty zleciłeś tę zmianę, zignoruj tę wiadomość.
            </p>
        </div>
    </div>";

                await _emailService.SendEmailAsync(
                    updateDto.Email,
                    "Potwierdź zmianę adresu e-mail - Medisure",
                    emailBodyNew
                );

                var emailBodyOld = $@"
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;'>
        <div style='background-color: #F59E0B; padding: 30px; text-align: center;'>
            <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Alert bezpieczeństwa</h1>
        </div>
        <div style='padding: 30px;'>
            <p style='color: #333; font-size: 16px;'>Witaj, <strong>{user.FirstName}</strong>.</p>
            <p style='color: #333; font-size: 16px;'>
                Zlecono zmianę adresu e-mail Twojego konta na: <strong>{updateDto.Email}</strong>.
            </p>
            <p style='color: #333; font-size: 16px;'>
                Jeśli to Twoja decyzja – nie musisz nic robić. Zmiana nastąpi po potwierdzeniu linku wysłanego na nowy adres.
            </p>
            <div style='background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;'>
                <p style='margin: 0; color: #92400E; font-weight: bold;'>To nie Ty?</p>
                <p style='margin: 5px 0 0 0; color: #92400E; font-size: 14px;'>Skontaktuj się z nami natychmiast i zmień hasło do konta.</p>
            </div>
        </div>
    </div>";

                await _emailService.SendEmailAsync(user.Email, "Alert bezpieczeństwa: Zmiana adresu e-mail", emailBodyOld);
                
        }

        await _logService.LogAsync("UPDATE_PROFILE", $"Profil użytkownika '{user.UserName}' został zaktualizowany.", user.UserName, user.Id);
        return Ok(new
        {
            email = user.Email,
            firstName = user.FirstName,
            lastName = user.LastName,
            phoneNumber = user.PhoneNumber,
            birthDate = user.BirthDate,
            EmailChangePending = isEmailChangeRequest
        });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        if (user.TwoFactorEnabled)
        {
            if (string.IsNullOrWhiteSpace(model.TwoFactorCode))
            {
                return BadRequest(new { Message = "Wymagany kod z aplikacji uwierzytelniającej." });
            }

            var cleanCode = model.TwoFactorCode.Replace(" ", "").Replace("-", "");

            var is2faValid = await _userManager.VerifyTwoFactorTokenAsync(
                user, 
                _userManager.Options.Tokens.AuthenticatorTokenProvider, 
                cleanCode);

            if (!is2faValid)
            {
                await _logService.LogAsync("SECURITY_FAIL", "Błędny kod 2FA (zmiana hasła)", user.UserName, user.Id, "Warning");
                return BadRequest(new { Message = "Nieprawidłowy kod weryfikacyjny 2FA." });
            }
        }

        var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

        if (result.Succeeded)
        {
            await _userManager.UpdateSecurityStampAsync(user);

            await _notificationService.CreateNotificationAsync(user.Id, "Zmiana hasła", "Twoje hasło zostało zmienione.", "Security");
            await _emailService.SendEmailAsync(user.Email, "Zmiana hasła", "Twoje hasło zostało pomyślnie zmienione.");

            return Ok(new { Message = "Hasło zostało pomyślnie zmienione." });
        }

        return BadRequest(result.Errors);
    }

    [HttpGet("2fa/setup")]
    public async Task<IActionResult> GetTwoFactorSetup()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var unformattedKey = await _userManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(unformattedKey))
        {
            await _userManager.ResetAuthenticatorKeyAsync(user);
            unformattedKey = await _userManager.GetAuthenticatorKeyAsync(user);
        }

        var email = user.Email;
        var authenticatorUri = GenerateQrCodeUri(email, unformattedKey);

        return Ok(new { Key = unformattedKey, AuthenticatorUri = authenticatorUri, IsEnabled = user.TwoFactorEnabled });
    }

    [HttpPost("2fa/enable")]
    public async Task<IActionResult> EnableTwoFactor([FromBody] TwoFactorDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var is2faTokenValid = await _userManager.VerifyTwoFactorTokenAsync(
            user, _userManager.Options.Tokens.AuthenticatorTokenProvider, dto.Code.Replace(" ", string.Empty));

        if (!is2faTokenValid)
        {
            return BadRequest(new { Message = "Kod weryfikacyjny jest nieprawidłowy." });
        }

        await _userManager.SetTwoFactorEnabledAsync(user, true);
        await _logService.LogAsync("2FA_ENABLED", $"Użytkownik {user.Email} włączył 2FA.", user.Email, user.Id,
            "Security");

        return Ok(new { Message = "Weryfikacja dwuetapowa została włączona." });
    }

    [HttpPost("2fa/disable")]
    public async Task<IActionResult> DisableTwoFactor([FromBody] Disable2FaDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();
        
        if (!await _userManager.CheckPasswordAsync(user, dto.Password))
        {
            await _logService.LogAsync("2FA_OSTRZEZENIE", "Próba wyłączenia 2FA błędnym hasłem", user.UserName, user.Id, "Warning");
            return BadRequest(new { Message = "Błędne hasło." });
        }
        
        var result = await _userManager.SetTwoFactorEnabledAsync(user, false);
        if(result.Succeeded)
        {
            await _logService.LogAsync("2FA_WYLACZENIE", $"Użytkownik {user.Email} wyłączył 2FA.", user.Email, user.Id,
                "Warning");
            return Ok(new { Message = "Weryfikacja dwuetapowa została wyłączona." });
        }
        return BadRequest(new { Message = "Nie udało się wyłączyć 2FA." });
        
    }

    private string GenerateQrCodeUri(string email, string unformattedKey)
    {
        return string.Format(
            "otpauth://totp/{0}:{1}?secret={2}&issuer={0}&digits=6",
            _urlEncoder.Encode("Medisure"),
            _urlEncoder.Encode(email),
            unformattedKey);
    }
}