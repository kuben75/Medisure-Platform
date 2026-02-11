using backend.Controllers;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace backend.Tests;

public class AccountControllerTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<ILogService> _logServiceMock;
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly AccountController _sut; 

    public AccountControllerTests()
    {
        var userStoreMock = new Mock<IUserStore<ApplicationUser>>();
        
        var options = new IdentityOptions();
        options.Tokens.AuthenticatorTokenProvider = "Email"; 

        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            userStoreMock.Object, 
            Microsoft.Extensions.Options.Options.Create(options), 
            null!, null!, null!, null!, null!, null!, null!);

        _logServiceMock = new Mock<ILogService>();
        _notificationServiceMock = new Mock<INotificationService>();
        _emailServiceMock = new Mock<IEmailService>();
        _configurationMock = new Mock<IConfiguration>();
        var urlEncoder = UrlEncoder.Default;

        _sut = new AccountController(
            _userManagerMock.Object,
            _logServiceMock.Object,
            _notificationServiceMock.Object,
            urlEncoder,
            _emailServiceMock.Object,
            _configurationMock.Object
        );
    }

    
    private void SetupUserInContext(string userId, string userName)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, userName)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    [Fact]
    public async Task UpdateProfile_ShouldUpdateBasicInfo_WhenDataIsCorrect()
    {
        var userId = "user1";
        SetupUserInContext(userId, "Jan");

        var user = new ApplicationUser { Id = userId, Email = "jan@test.com", FirstName = "OldName" };
        
        _userManagerMock.Setup(x => x.FindByIdAsync(userId)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.UpdateAsync(user)).ReturnsAsync(IdentityResult.Success);

        var dto = new UpdateUserDto
        {
            FirstName = "NewName",
            LastName = "NewLast",
            Email = "jan@test.com", 
            PhoneNumber = "123"
        };

        var result = await _sut.UpdateProfile(dto);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        user.FirstName.Should().Be("NewName");
        user.PhoneNumber.Should().Be("123");
        
        _logServiceMock.Verify(x => x.LogAsync("EDYCJA_PROFILU", It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), "Info", false), Times.Once);
    }

    [Fact]
    public async Task UpdateProfile_ShouldBlockBirthDateChange_IfAlreadySet()
    {
        var userId = "user1";
        SetupUserInContext(userId, "Jan");

        var user = new ApplicationUser 
        { 
            Id = userId, Email = "jan@test.com", 
            BirthDate = new DateTime(1990, 1, 1), 
            FirstName = "A", LastName = "B" 
        };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId)).ReturnsAsync(user);

        var dto = new UpdateUserDto
        {
            Email = "jan@test.com",
            BirthDate = new DateTime(2000, 1, 1), 
            FirstName = "A", LastName = "B"
        };

        var result = await _sut.UpdateProfile(dto);

        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var error = badRequest.Value as ErrorResponse;
        error!.Message.Should().Contain("nie może być zmieniona");
    }

    [Fact]
    public async Task ChangePassword_ShouldSucceed_WhenCurrentPasswordIsCorrect()
    {
        var userId = "user1";
        SetupUserInContext(userId, "Jan");
        var user = new ApplicationUser { Id = userId, Email = "jan@test.com", TwoFactorEnabled = false };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId)).ReturnsAsync(user);
        
        _userManagerMock.Setup(x => x.ChangePasswordAsync(user, "OldPass", "NewPass"))
            .ReturnsAsync(IdentityResult.Success);

        var dto = new ChangePasswordDto { CurrentPassword = "OldPass", NewPassword = "NewPass", ConfirmNewPassword = "NewPass" };

        var result = await _sut.ChangePassword(dto);

        result.Should().BeOfType<OkObjectResult>();
        
        _emailServiceMock.Verify(x => x.SendEmailAsync(user.Email, "Zmiana hasła", It.IsAny<string>(), null, null), Times.Once);
        _notificationServiceMock.Verify(x => x.CreateNotificationAsync(userId, "Zmiana hasła", It.IsAny<string>(), "Bezpieczeństwo"), Times.Once);
    }

    [Fact]
    public async Task EnableTwoFactor_ShouldSucceed_WhenCodeIsCorrect()
    {
        var userId = "user1";
        SetupUserInContext(userId, "Jan");
        var user = new ApplicationUser { Id = userId, Email = "jan@test.com" };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId)).ReturnsAsync(user);
        
        _userManagerMock.Setup(x => x.VerifyTwoFactorTokenAsync(user, It.IsAny<string>(), "123456"))
            .ReturnsAsync(true);
        

        var dto = new TwoFactorDto { Code = "123456" };

        var result = await _sut.EnableTwoFactor(dto);

        result.Should().BeOfType<OkObjectResult>();
        _userManagerMock.Verify(x => x.SetTwoFactorEnabledAsync(user, true), Times.Once);
    }
}