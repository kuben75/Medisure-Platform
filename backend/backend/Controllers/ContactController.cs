using backend.Services;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;

    public ContactController(INotificationService notificationService, IEmailService emailService)
    {
        _notificationService = notificationService;
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ContactFormDto dto)
    {
        await _notificationService.NotifyAllAdminsAsync(
            "Nowe zapytanie ofertowe",
            $"Od: {dto.Name} {dto.Surname} ({dto.Email}).\nTemat: {dto.Topic} \n Wiadomość: {dto.Message}",
            "Informacja"
        );

        var emailBody = $@"
                <h3>Dziękujemy za kontakt, {dto.Name}!</h3>
                <p>Twoje zapytanie w sprawie: <strong>{dto.Topic}</strong> zostało przyjęte.</p>
                <p>Nasz zespół skontaktuje się z Tobą w ciągu 24h.</p>
            ";
        _ = _emailService.SendEmailAsync(dto.Email, "Potwierdzenie zgłoszenia - Medisure", emailBody);

        return Ok(new { Message = "Wiadomość wysłana." });
    }
}