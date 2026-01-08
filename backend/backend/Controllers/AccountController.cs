using backend.DTOs;
using backend.Models;
using backend.Services;
using backend.Helpers; 
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
    private readonly INotificationService _notificationService;
    private readonly UrlEncoder _urlEncoder;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AccountController(
        UserManager<ApplicationUser> userManager,
        ILogService logService,
        INotificationService notificationService,
        UrlEncoder urlEncoder,
        IEmailService emailService,
        IConfiguration configuration
    )
    {
        _userManager = userManager;
        _logService = logService;
        _notificationService = notificationService;
        _urlEncoder = urlEncoder;
        _emailService = emailService;
        _configuration = configuration;
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserDto updateDto)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Unauthorized();

        bool isEmailChangeRequest = !string.Equals(user.Email, updateDto.Email, StringComparison.OrdinalIgnoreCase);
        
        if (isEmailChangeRequest)
        {
            if (string.IsNullOrEmpty(updateDto.CurrentPassword))
                return BadRequest(new { Message = "Aby zmienić adres e-mail, musisz podać aktualne hasło." });

            if (!await _userManager.CheckPasswordAsync(user, updateDto.CurrentPassword))
            {
                await _logService.LogAsync("BEZPIECZENSTWO", "Błędne hasło (zmiana email)", user.UserName, user.Id, "Warning");
                return BadRequest(new { Message = "Podane hasło jest nieprawidłowe." });
            }

            var authResult = await VerifyTwoFactorIfNeeded(user, updateDto.TwoFactorCode);
            if (!authResult.Success) return BadRequest(new { Message = authResult.Message });

            if (await _userManager.FindByEmailAsync(updateDto.Email) != null)
                return BadRequest(new { Message = "Ten adres e-mail jest już zajęty." });
        }

        user.FirstName = updateDto.FirstName;
        user.LastName = updateDto.LastName;
        user.PhoneNumber = updateDto.PhoneNumber;

        if (updateDto.BirthDate.HasValue)
        {
            if (!IsAgeValid(updateDto.BirthDate.Value))
                return BadRequest(new { Message = "Wiek musi być między 18 a 99 lat." });

            user.BirthDate = DateTime.SpecifyKind(updateDto.BirthDate.Value, DateTimeKind.Utc);
        }
        
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded) 
        {
            await _logService.LogAsync("EDYCJA_PROFILU", $"Błąd DB: {string.Join(", ", updateResult.Errors.Select(e => e.Description))}", user.UserName, user.Id, "Error");
            return BadRequest(updateResult.Errors);
        }

        if (isEmailChangeRequest)
        {
            await SendEmailChangeNotifications(user, updateDto.Email);
        }

        await _logService.LogAsync("EDYCJA_PROFILU", $"Profil użytkownika '{user.UserName}' został zaktualizowany.", user.UserName, user.Id);
        
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
        var user = await GetCurrentUserAsync();
        if (user == null) return Unauthorized();

        var authResult = await VerifyTwoFactorIfNeeded(user, model.TwoFactorCode);
        if (!authResult.Success) return BadRequest(new { Message = authResult.Message });

        var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

        if (result.Succeeded)
        {
            await _userManager.UpdateSecurityStampAsync(user);
            await _notificationService.CreateNotificationAsync(user.Id, "Zmiana hasła", "Twoje hasło zostało zmienione.", "Bezpieczeństwo");
            await _emailService.SendEmailAsync(user.Email, "Zmiana hasła", "Twoje hasło zostało pomyślnie zmienione.");

            return Ok(new { Message = "Hasło zostało pomyślnie zmienione." });
        }

        return BadRequest(result.Errors);
    }

    [HttpGet("2fa/setup")]
    public async Task<IActionResult> GetTwoFactorSetup()
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Unauthorized();

        var unformattedKey = await _userManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(unformattedKey))
        {
            await _userManager.ResetAuthenticatorKeyAsync(user);
            unformattedKey = await _userManager.GetAuthenticatorKeyAsync(user);
        }

        var authenticatorUri = GenerateQrCodeUri(user.Email, unformattedKey);
        return Ok(new { Key = unformattedKey, AuthenticatorUri = authenticatorUri, IsEnabled = user.TwoFactorEnabled });
    }

    [HttpPost("2fa/enable")]
    public async Task<IActionResult> EnableTwoFactor([FromBody] TwoFactorDto dto)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Unauthorized();

        var is2faTokenValid = await _userManager.VerifyTwoFactorTokenAsync(
            user, _userManager.Options.Tokens.AuthenticatorTokenProvider, dto.Code.Replace(" ", string.Empty));

        if (!is2faTokenValid)
            return BadRequest(new { Message = "Kod weryfikacyjny jest nieprawidłowy." });

        await _userManager.SetTwoFactorEnabledAsync(user, true);
        await _logService.LogAsync("2FA_WLACZENIE", $"Użytkownik {user.Email} włączył 2FA.", user.Email, user.Id, "Security");

        return Ok(new { Message = "Weryfikacja dwuetapowa została włączona." });
    }

    [HttpPost("2fa/disable")]
    public async Task<IActionResult> DisableTwoFactor([FromBody] Disable2FaDto dto)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Unauthorized();
        
        if (!await _userManager.CheckPasswordAsync(user, dto.Password))
        {
            await _logService.LogAsync("2FA_OSTRZEZENIE", "Próba wyłączenia 2FA błędnym hasłem", user.UserName, user.Id, "Warning");
            return BadRequest(new { Message = "Błędne hasło." });
        }
        
        var result = await _userManager.SetTwoFactorEnabledAsync(user, false);
        if(result.Succeeded)
        {
            await _logService.LogAsync("2FA_WYLACZENIE", $"Użytkownik {user.Email} wyłączył 2FA.", user.Email, user.Id, "Warning");
            return Ok(new { Message = "Weryfikacja dwuetapowa została wyłączona." });
        }
        return BadRequest(new { Message = "Nie udało się wyłączyć 2FA." });
    }


    private async Task<ApplicationUser?> GetCurrentUserAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return null;
        return await _userManager.FindByIdAsync(userId);
    }

    private async Task<(bool Success, string Message)> VerifyTwoFactorIfNeeded(ApplicationUser user, string code)
    {
        if (!user.TwoFactorEnabled) return (true, string.Empty);

        if (string.IsNullOrWhiteSpace(code))
            return (false, "Wymagany kod z aplikacji uwierzytelniającej.");

        var cleanCode = code.Replace(" ", "").Replace("-", "");
        var is2faValid = await _userManager.VerifyTwoFactorTokenAsync(
            user, _userManager.Options.Tokens.AuthenticatorTokenProvider, cleanCode);

        if (!is2faValid)
        {
            await _logService.LogAsync("BEZPIECZENSTWO", "Błędny kod 2FA (weryfikacja)", user.UserName, user.Id, "Warning");
            return (false, "Nieprawidłowy kod weryfikacyjny 2FA.");
        }

        return (true, string.Empty);
    }

    private bool IsAgeValid(DateTime birthDate)
    {
        var today = DateTime.UtcNow.Date;
        var age = today.Year - birthDate.Year;
        if (birthDate.Date > today.AddYears(-age)) age--;
        return age >= 18 && age <= 99;
    }

    private async Task SendEmailChangeNotifications(ApplicationUser user, string newEmail)
    {
        var token = await _userManager.GenerateChangeEmailTokenAsync(user, newEmail);
        var encodedToken = WebUtility.UrlEncode(token);
        var confirmLink = $"{_configuration["FrontendUrl"]}/potwierdz-nowy-email?userId={user.Id}&newEmail={newEmail}&token={encodedToken}";

        var bodyNew = EmailTemplates.GetEmailChangeConfirmation(user.FirstName, newEmail, confirmLink);
        await _emailService.SendEmailAsync(newEmail, "Potwierdź zmianę adresu e-mail - Medisure", bodyNew);

        var bodyOld = EmailTemplates.GetSecurityAlert(user.FirstName, newEmail);
        await _emailService.SendEmailAsync(user.Email, "Alert bezpieczeństwa: Zmiana adresu e-mail", bodyOld);
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