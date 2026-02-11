using backend.DTOs;
using backend.Helpers;
using backend.Services.Interfaces;
using System.Net;

namespace backend.Services;

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
        var safeMessage = WebUtility.HtmlEncode(dto.Message);
        var safeTopic = WebUtility.HtmlEncode(dto.Topic);
        var safeName = WebUtility.HtmlEncode(dto.Name);

      
        var adminContent = $"Od: {safeName} {dto.Surname} ({dto.Email}).\nTemat: {safeTopic}\nWiadomość: {safeMessage}";

        await _notificationService.NotifyAllAdminsAsync(
            "Nowe zapytanie ofertowe",
            adminContent,
            "Informacja"
        );

        
        var emailBody = EmailTemplates.GetContactConfirmation(safeName, safeTopic);
        
        try 
        {
            await _emailService.SendEmailAsync(dto.Email, "Potwierdzenie zgłoszenia - Medisure", emailBody);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ContactService] Błąd wysyłania potwierdzenia: {ex.Message}");
        }
    }
}