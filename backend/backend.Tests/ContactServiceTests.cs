using backend.DTOs;
using backend.Services;
using backend.Services.Interfaces;


namespace backend.Tests;

public class ContactServiceTests
{
    private readonly Mock<INotificationService> _notificationMock;
    private readonly Mock<IEmailService> _emailMock;
    private readonly ContactService _sut; 

    public ContactServiceTests()
    {
        _notificationMock = new Mock<INotificationService>();
        _emailMock = new Mock<IEmailService>();
        
        _sut = new ContactService(_notificationMock.Object, _emailMock.Object);
    }

    [Fact]
    public async Task HandleContactFormAsync_ShouldNotifyAdminsAndSendConfirmationEmail_OnValidData()
    {
        var dto = new ContactFormDto
        {
            Name = "Jan",
            Surname = "Kowalski",
            Email = "jan@test.com",
            Topic = "Oferta",
            Message = "Proszę o kontakt"
        };
        
        await _sut.HandleContactFormAsync(dto);


        _notificationMock.Verify(x => x.NotifyAllAdminsAsync(
            "Nowe zapytanie ofertowe",
            It.Is<string>(s => s.Contains("Jan") && s.Contains("Kowalski") && s.Contains("Proszę o kontakt")),
            "Informacja"
        ), Times.Once);

        _emailMock.Verify(x => x.SendEmailAsync(
            dto.Email,
            "Potwierdzenie zgłoszenia - Medisure",
            It.IsAny<string>(), 
            null,
            null
        ), Times.Once);
    }

    [Fact]
    public async Task HandleContactFormAsync_ShouldSanitizeInputs_ToPreventXSS()
    {
        var dto = new ContactFormDto
        {
            Name = "<script>alert('test')</script>",
            Surname = "Hacker",
            Email = "hacker@test.com",
            Topic = "<b>Bold</b>",
            Message = "Message <img src=x onerror=alert(1)>"
        };


        await _sut.HandleContactFormAsync(dto);

  
        _notificationMock.Verify(x => x.NotifyAllAdminsAsync(
            It.IsAny<string>(),
            It.Is<string>(content => 
                content.Contains("&lt;script&gt;") && 
                !content.Contains("<script>") &&
                content.Contains("&lt;b&gt;")        
            ),
            It.IsAny<string>()
        ), Times.Once);
    }

    [Fact]
    public async Task HandleContactFormAsync_ShouldNotThrow_WhenEmailServiceFails()
    {
        var dto = new ContactFormDto 
        { 
            Name = "Test", Surname = "User", Email = "test@test.com", Topic = "T", Message = "M" 
        };

        _emailMock.Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), null, null))
            .ThrowsAsync(new Exception("SMTP Error"));

        Func<Task> act = async () => await _sut.HandleContactFormAsync(dto);

        await act.Should().NotThrowAsync();

        _notificationMock.Verify(x => x.NotifyAllAdminsAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }
}