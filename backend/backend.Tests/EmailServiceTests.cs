using backend.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;


namespace backend.Tests;

public class EmailServiceTests
{
    private readonly Mock<ILogger<EmailService>> _loggerMock;

    public EmailServiceTests()
    {
        _loggerMock = new Mock<ILogger<EmailService>>();
    }

    [Fact]
    public async Task SendEmailAsync_ShouldLogError_WhenConfigurationIsMissing()
    {
    
        var inMemorySettings = new Dictionary<string, string?>();
        
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var sut = new EmailService(configuration, _loggerMock.Object);

        await sut.SendEmailAsync("test@test.com", "Temat", "Tresc");

      
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Brak konfiguracji SMTP")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task SendEmailAsync_ShouldCatchExceptionAndLogError_WhenSmtpConnectionFails()
    {

        var inMemorySettings = new Dictionary<string, string?>
        {
            {"EmailSettings:SmtpServer", "fake.smtp.server"},
            {"EmailSettings:SmtpPort", "587"},
            {"EmailSettings:SenderEmail", "admin@medisure.pl"},
            {"EmailSettings:SenderName", "Medisure"},
            {"EmailSettings:Password", "secretPassword"}
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var sut = new EmailService(configuration, _loggerMock.Object);

        await sut.SendEmailAsync("klient@test.com", "Temat", "Tresc");

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Błąd wysyłania maila")),
                It.IsAny<Exception>(), 
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}