using backend.Controllers;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

public class AuthControllerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<ILogService> _logServiceMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly IMemoryCache _memoryCache;
    private readonly AuthController _sut; 

    public AuthControllerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);

        var userStore = new Mock<IUserStore<ApplicationUser>>();
        var identityOptions = new IdentityOptions();
        identityOptions.Tokens.AuthenticatorTokenProvider = "Email";
        identityOptions.Tokens.PasswordResetTokenProvider = "ResetPassword"; 

        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            userStore.Object, 
            Microsoft.Extensions.Options.Options.Create(identityOptions), 
            null!, null!, null!, null!, null!, null!, null!);

        _tokenServiceMock = new Mock<ITokenService>();
        _logServiceMock = new Mock<ILogService>();
        _emailServiceMock = new Mock<IEmailService>();
        _notificationServiceMock = new Mock<INotificationService>();
        _configurationMock = new Mock<IConfiguration>();
        _memoryCache = new MemoryCache(new MemoryCacheOptions());

        _configurationMock.Setup(c => c["FrontendUrl"]).Returns("http://localhost");

        _sut = new AuthController(
            _userManagerMock.Object,
            _configurationMock.Object,
            _logServiceMock.Object,
            _emailServiceMock.Object,
            _notificationServiceMock.Object,
            _tokenServiceMock.Object,
            _context,
            _memoryCache
        );
        
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext() 
        };
    }

    // ==========================================
    // SEKCJA 1: REJESTRACJA 
    // ==========================================

    [Fact]
    public async Task Register_ShouldSucceed_AndSendEmails_WhenDataIsValid()
    {
        var dto = new RegisterDto { Email = "new@test.com", Password = "Pass", FirstName = "J", LastName = "K" };
        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync((ApplicationUser?)null);
        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password)).ReturnsAsync(IdentityResult.Success);
        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<ApplicationUser>(), "User")).ReturnsAsync(IdentityResult.Success);
        _userManagerMock.Setup(x => x.GenerateEmailConfirmationTokenAsync(It.IsAny<ApplicationUser>())).ReturnsAsync("token");

       
        var result = await _sut.Register(dto);

        
        result.Should().BeOfType<OkObjectResult>();
        _emailServiceMock.Verify(x => x.SendEmailAsync(dto.Email, It.IsAny<string>(), It.IsAny<string>(), null, null), Times.Once);
        _notificationServiceMock.Verify(x => x.CreateNotificationAsync(It.IsAny<string>(), "Witamy w Medisure!", It.IsAny<string>(), "Informacja"), Times.Once);
    }

    [Fact]
    public async Task Register_ShouldFail_WhenEmailAlreadyExists()
    {
        var dto = new RegisterDto { Email = "taken@test.com", Password = "P", FirstName = "J", LastName = "K" };
        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync(new ApplicationUser());

        
        var result = await _sut.Register(dto);

        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var error = badRequest.Value as ErrorResponse;
        error!.Message.Should().Contain("już istnieje");
        _userManagerMock.Verify(x => x.CreateAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Register_ShouldFail_WhenPasswordIsTooWeak()
    {
        var dto = new RegisterDto { Email = "weak@test.com", Password = "123", FirstName = "J", LastName = "K" };
        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync((ApplicationUser?)null);
        
        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Password too short" }));

        var result = await _sut.Register(dto);

        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var error = badRequest.Value as ErrorResponse;
        error!.Message.Should().Contain("Password too short");
    }

    [Fact]
    public async Task Register_ShouldRollback_WhenRoleAssignmentFails()
    {
   
        var dto = new RegisterDto { Email = "norole@test.com", Password = "P", FirstName = "J", LastName = "K" };
        var createdUser = new ApplicationUser { Email = dto.Email };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync((ApplicationUser?)null);
        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password)).ReturnsAsync(IdentityResult.Success);
        
        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<ApplicationUser>(), "User"))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Role error" }));

        var result = await _sut.Register(dto);

        var serverError = result.Should().BeOfType<ObjectResult>().Subject;
        serverError.StatusCode.Should().Be(500);

        _userManagerMock.Verify(x => x.DeleteAsync(It.IsAny<ApplicationUser>()), Times.Once);
    }

    // ==========================================
    // SEKCJA 2: LOGOWANIE 
    // ==========================================

    [Fact]
    public async Task Login_ShouldReturnToken_WhenCredentialsCorrect()
    {
        var user = new ApplicationUser { Id="u1", Email = "ok@test.com", EmailConfirmed = true };
        _userManagerMock.Setup(x => x.FindByEmailAsync(user.Email)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.CheckPasswordAsync(user, "Pass")).ReturnsAsync(true);
        _userManagerMock.Setup(x => x.IsLockedOutAsync(user)).ReturnsAsync(false);
        _userManagerMock.Setup(x => x.GetRolesAsync(user)).ReturnsAsync(new List<string> { "User" });
        _tokenServiceMock.Setup(x => x.GenerateJwtToken(user, It.IsAny<IList<string>>())).Returns("JWT_TOKEN");

        var result = await _sut.Login(new LoginDto { Email = user.Email, Password = "Pass" });

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var json = System.Text.Json.JsonSerializer.Serialize(okResult.Value);
        json.Should().Contain("JWT_TOKEN");
    }

    [Fact]
    public async Task Login_ShouldCheckForExpiringPackages_WhenLoggingIn()
    {
        
        var user = new ApplicationUser { Id="u1", Email = "expiry@test.com", EmailConfirmed = true };
        
        _context.Packages.Add(new Package { Id=1, Name="P", Price="10", Description="D", Category="C", IncludedSpecializations="", Features="" });
        _context.UserPackages.Add(new UserPackage { 
            UserId = user.Id, PackageId = 1, Status = "Active", 
            EndDate = DateTime.UtcNow.AddDays(3), 
            User = null!, Package = null!, PriceAtPurchase="", Street="", HouseNumber="", City="", ZipCode="", PaymentMethod="", TransactionId="", Pesel=""
        });
        await _context.SaveChangesAsync();

        _userManagerMock.Setup(x => x.FindByEmailAsync(user.Email)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.CheckPasswordAsync(user, "Pass")).ReturnsAsync(true);
        _userManagerMock.Setup(x => x.GetRolesAsync(user)).ReturnsAsync(new List<string>());

        
        await _sut.Login(new LoginDto { Email = user.Email, Password = "Pass" });

        _notificationServiceMock.Verify(x => x.CreateNotificationAsync(user.Id, "Pakiet wkrótce wygaśnie", It.IsAny<string>(), "Ostrzeżenie"), Times.Once);
    }

    [Fact]
    public async Task Login_ShouldIncrementAccessFailedCount_WhenPasswordIsWrong()
    {
      
        var user = new ApplicationUser { Email = "fail@test.com", EmailConfirmed = true };
        _userManagerMock.Setup(x => x.FindByEmailAsync(user.Email)).ReturnsAsync(user);
        
        _userManagerMock.Setup(x => x.CheckPasswordAsync(user, "Wrong")).ReturnsAsync(false);
        _userManagerMock.Setup(x => x.IsLockedOutAsync(user)).ReturnsAsync(false);

        var result = await _sut.Login(new LoginDto { Email = user.Email, Password = "Wrong" });

        result.Should().BeOfType<UnauthorizedObjectResult>();
        
        _userManagerMock.Verify(x => x.AccessFailedAsync(user), Times.Once);
    }

    [Fact]
    public async Task Login_ShouldFail_WhenAccountIsLocked()
    {
        var user = new ApplicationUser { Email = "locked@test.com" };
        _userManagerMock.Setup(x => x.FindByEmailAsync(user.Email)).ReturnsAsync(user);
        
        
        _userManagerMock.Setup(x => x.IsLockedOutAsync(user)).ReturnsAsync(true);

        var result = await _sut.Login(new LoginDto { Email = user.Email, Password = "Any" });

        var forbidden = result.Should().BeOfType<ObjectResult>().Subject;
        forbidden.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task Login_ShouldFail_WhenEmailNotConfirmed()
    {
        var user = new ApplicationUser { Email = "unconfirmed@test.com", EmailConfirmed = false }; 
        _userManagerMock.Setup(x => x.FindByEmailAsync(user.Email)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.CheckPasswordAsync(user, "Pass")).ReturnsAsync(true);

        var result = await _sut.Login(new LoginDto { Email = user.Email, Password = "Pass" });

        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task Login_ShouldAskFor2FA_WhenEnabled()
    {
        var user = new ApplicationUser { Email = "2fa@test.com", EmailConfirmed = true, TwoFactorEnabled = true };
        _userManagerMock.Setup(x => x.FindByEmailAsync(user.Email)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.CheckPasswordAsync(user, "Pass")).ReturnsAsync(true);
        _userManagerMock.Setup(x => x.GetTwoFactorEnabledAsync(user)).ReturnsAsync(true);

        var result = await _sut.Login(new LoginDto { Email = user.Email, Password = "Pass" });

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var json = System.Text.Json.JsonSerializer.Serialize(okResult.Value);
        json.Should().Contain("REQUIRES_2FA");

        _tokenServiceMock.Verify(x => x.GenerateJwtToken(It.IsAny<ApplicationUser>(), It.IsAny<IList<string>>()), Times.Never);
    }

    [Fact]
    public async Task Verify2FaCode_ShouldSucceed_WhenCodeAndPassAreCorrect()
    {
        var user = new ApplicationUser { Id="u1", Email = "2fa@test.com", TwoFactorEnabled = true };
        _userManagerMock.Setup(x => x.FindByEmailAsync(user.Email)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.CheckPasswordAsync(user, "Pass")).ReturnsAsync(true);
        _userManagerMock.Setup(x => x.GetRolesAsync(user)).ReturnsAsync(new List<string>());
        
        _userManagerMock.Setup(x => x.VerifyTwoFactorTokenAsync(user, It.IsAny<string>(), "123456")).ReturnsAsync(true);
        
        _tokenServiceMock.Setup(x => x.GenerateJwtToken(user, It.IsAny<IList<string>>())).Returns("JWT");

        var result = await _sut.Verify2FaCode(new TwoFactorLoginDto { Email = user.Email, Password = "Pass", Code = "123456" });

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var json = System.Text.Json.JsonSerializer.Serialize(okResult.Value);
        json.Should().Contain("JWT");
    }

    [Fact]
    public async Task Verify2FaCode_ShouldFail_WhenCodeIsWrong()
    {
        
        var user = new ApplicationUser { Email = "2fa@test.com" };
        _userManagerMock.Setup(x => x.FindByEmailAsync(user.Email)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.CheckPasswordAsync(user, "Pass")).ReturnsAsync(true);
        
        _userManagerMock.Setup(x => x.VerifyTwoFactorTokenAsync(user, It.IsAny<string>(), "000")).ReturnsAsync(false);

        var result = await _sut.Verify2FaCode(new TwoFactorLoginDto { Email = user.Email, Password = "Pass", Code = "000" });

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    // ==========================================
    // SEKCJA 3: ZAPOMNIANE HASŁO 
    // ==========================================

    [Fact]
    public async Task ForgotPassword_ShouldUseCache_ToPreventSpam()
    {
    
        var dto = new ForgotPasswordDto { Email = "spam@test.com" };
        var user = new ApplicationUser { Email = dto.Email };
        
        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.GeneratePasswordResetTokenAsync(user)).ReturnsAsync("t");

        await _sut.ForgotPassword(dto); 
        await _sut.ForgotPassword(dto); 

      
        _emailServiceMock.Verify(x => x.SendEmailAsync(dto.Email, It.IsAny<string>(), It.IsAny<string>(), null, null), Times.Once);
    }

    [Fact]
    public async Task ForgotPassword_ShouldReturnOk_EvenIfUserDoesNotExist()
    {
        _userManagerMock.Setup(x => x.FindByEmailAsync("ghost@test.com")).ReturnsAsync((ApplicationUser?)null);

        var result = await _sut.ForgotPassword(new ForgotPasswordDto { Email = "ghost@test.com" });

        result.Should().BeOfType<OkObjectResult>(); 
        _emailServiceMock.Verify(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), null, null), Times.Never); // Ale maila nie ma
    }

    [Fact]
    public async Task ResetPassword_ShouldSucceed_WhenTokenIsValid()
    {
        var dto = new ResetPasswordDto { Email = "reset@test.com", Token = "validToken", NewPassword = "NewPass" };
        var user = new ApplicationUser { Email = dto.Email };
        
        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.ResetPasswordAsync(user, dto.Token, dto.NewPassword)).ReturnsAsync(IdentityResult.Success);

        var result = await _sut.ResetPassword(dto);

        result.Should().BeOfType<OkObjectResult>();
        
        _userManagerMock.Verify(x => x.ResetAccessFailedCountAsync(user), Times.Once);
    }

    [Fact]
    public async Task ResetPassword_ShouldReturnOk_WhenUserDoesNotExist()
    {
  
        _userManagerMock.Setup(x => x.FindByEmailAsync("ghost@test.com")).ReturnsAsync((ApplicationUser?)null);

        var result = await _sut.ResetPassword(new ResetPasswordDto { Email = "ghost@test.com", Token = "t", NewPassword = "p" });

        result.Should().BeOfType<OkObjectResult>(); 
    }

    [Fact]
    public async Task VerifyResetToken_ShouldReturnOk_WhenTokenIsValid()
    {
        var user = new ApplicationUser { Email = "u@t.com" };
        _userManagerMock.Setup(x => x.FindByEmailAsync("u@t.com")).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.VerifyUserTokenAsync(user, It.IsAny<string>(), "ResetPassword", "token")).ReturnsAsync(true);

        var result = await _sut.VerifyResetToken("u@t.com", "token");

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task VerifyResetToken_ShouldFail_WhenTokenIsInvalid()
    {
        var user = new ApplicationUser { Email = "u@t.com" };
        _userManagerMock.Setup(x => x.FindByEmailAsync("u@t.com")).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.VerifyUserTokenAsync(user, It.IsAny<string>(), "ResetPassword", "bad_token")).ReturnsAsync(false);

        var result = await _sut.VerifyResetToken("u@t.com", "bad_token");

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    // ==========================================
    // SEKCJA 4: POTWIERDZANIE EMAIL 
    // ==========================================

    [Fact]
    public async Task ConfirmEmail_ShouldSucceed_WhenTokenValid()
    {
        var user = new ApplicationUser { Id = "u1", Email = "c@test.com" };
        _userManagerMock.Setup(x => x.FindByIdAsync("u1")).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.ConfirmEmailAsync(user, "token")).ReturnsAsync(IdentityResult.Success);

        var result = await _sut.ConfirmEmail("u1", "token");

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ConfirmEmail_ShouldFail_WhenUserNotFound()
    {
       
        _userManagerMock.Setup(x => x.FindByIdAsync("ghost")).ReturnsAsync((ApplicationUser?)null);

        var result = await _sut.ConfirmEmail("ghost", "token");

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task ConfirmNewEmail_ShouldChangeEmailAndUsername()
    {
        var user = new ApplicationUser { Id = "u1", Email = "old@test.com", UserName = "old@test.com" };
        var newEmail = "new@test.com";
        var token = "t";

        _userManagerMock.Setup(x => x.FindByIdAsync("u1")).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.FindByNameAsync(newEmail)).ReturnsAsync((ApplicationUser?)null); // Email wolny
        _userManagerMock.Setup(x => x.ChangeEmailAsync(user, newEmail, token)).ReturnsAsync(IdentityResult.Success);

        var result = await _sut.ConfirmNewEmail("u1", newEmail, token);

        result.Should().BeOfType<OkObjectResult>();
        
        _userManagerMock.Verify(x => x.SetUserNameAsync(user, newEmail), Times.Once);
     
        _userManagerMock.Verify(x => x.UpdateSecurityStampAsync(user), Times.Once);
    }
}