using backend.DTOs;
using backend.Helpers;

namespace backend.Services;

public interface IContactService
{
    Task HandleContactFormAsync(ContactFormDto dto);
}

public class ContactService : IContactService
{
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;

    public ContactService(INotificationService notificationService, IEmailService emailService)
    {
        _notificationService = notificationService;
        _emailService = emailService;
    }

    public async Task HandleContactFormAsync(ContactFormDto dto)
    {
        await _notificationService.NotifyAllAdminsAsync(
            "Nowe zapytanie ofertowe",
            $"Od: {dto.Name} {dto.Surname} ({dto.Email}).\nTemat: {dto.Topic}\nWiadomość: {dto.Message}",
            "Informacja"
        );

        var emailBody = EmailTemplates.GetContactConfirmation(dto.Name, dto.Topic);
        
        _ = _emailService.SendEmailAsync(dto.Email, "Potwierdzenie zgłoszenia - Medisure", emailBody);
    }
}