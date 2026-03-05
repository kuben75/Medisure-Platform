using System.Net;
using System.Net.Mail;
using backend.Services.Interfaces;

namespace backend.Services;


public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(
        string to, string subject, string body, byte[]? attachmentData = null, string? attachmentName = null)
    {
        try
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var portString = _configuration["EmailSettings:SmtpPort"];
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var senderName = _configuration["EmailSettings:SenderName"];
            var password = _configuration["EmailSettings:Password"];
            if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(password))
            {
                _logger.LogError("Brak konfiguracji SMTP");
                return;
            }
            var port = int.Parse(portString!);
            
            using var client = new SmtpClient(smtpServer)
            { Port = port, Credentials = new NetworkCredential(senderEmail, password), EnableSsl = true,
            };
            
            using var mailMessage = new MailMessage
            { From = new MailAddress(senderEmail!, senderName), Subject = subject,
                Body = body, IsBodyHtml = true,
            };
            
            mailMessage.To.Add(to);
            if (attachmentData != null && !string.IsNullOrEmpty(attachmentName))
            {
                var stream = new MemoryStream(attachmentData);
                var attachment = new Attachment(stream, attachmentName, "application/pdf");
                mailMessage.Attachments.Add(attachment);
            }
            await client.SendMailAsync(mailMessage);
            _logger.LogInformation($"Email wysłany poprawnie do: {to}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Błąd wysyłania maila do {to}: {ex.Message}");
        }
    }
}
