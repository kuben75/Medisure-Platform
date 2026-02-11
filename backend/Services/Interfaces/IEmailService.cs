namespace backend.Services.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, byte[]? attachmentData = null, string? attachmentName = null);
}