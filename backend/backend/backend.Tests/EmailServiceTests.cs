using backend.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace backend.Tests;

public class EmailServiceTests
{
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly Mock<ILogger<EmailService>> _mockLogger;
    private readonly EmailService _service;

    public EmailServiceTests()
    {
        _mockConfig = new Mock<IConfiguration>();
        _mockLogger = new Mock<ILogger<EmailService>>();

        _mockConfig.Setup(c => c["EmailSettings:SmtpServer"]).Returns("fake.smtp.server");
        _mockConfig.Setup(c => c["EmailSettings:SmtpPort"]).Returns("587");
        _mockConfig.Setup(c => c["EmailSettings:SenderEmail"]).Returns("test@medisure.pl");
        _mockConfig.Setup(c => c["EmailSettings:SenderName"]).Returns("Medisure Test");
        _mockConfig.Setup(c => c["EmailSettings:Password"]).Returns("secret");

        _service = new EmailService(_mockConfig.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task SendEmailAsync_ShouldAttemptToSend_AndLogFailure_WhenServerIsFake()
    {
        await _service.SendEmailAsync("klient@gmail.com", "Temat", "Treść");

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Błąd wysyłania maila")),
                It.IsAny<Exception?>(), 
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()), 
            Times.Once);
    }
    
    [Fact]
    public async Task SendEmailAsync_ShouldHandleAttachments_WithoutCrashing()
    {
        byte[] fakePdf = new byte[] { 0x1, 0x2, 0x3 }; 

        await _service.SendEmailAsync("klient@gmail.com", "Temat", "Treść", fakePdf, "test.pdf");

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(), 
                It.IsAny<Exception?>(),   
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()), 
            Times.Once);
    }
}