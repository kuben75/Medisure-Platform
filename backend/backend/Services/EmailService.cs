using System.Net;
using System.Net.Mail;

namespace backend.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, byte[]? attachmentData = null, string? attachmentName = null);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body, byte[]? attachmentData = null, string? attachmentName = null)
    {
        try
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var port = int.Parse(_configuration["EmailSettings:SmtpPort"]);
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var senderName = _configuration["EmailSettings:SenderName"];
            var password = _configuration["EmailSettings:Password"];

            var client = new SmtpClient(smtpServer)
            {
                Port = port,
                Credentials = new NetworkCredential(senderEmail, password),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
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
            _logger.LogError($"Błąd wysyłania maila: {ex.Message}");
        }
    }
}