using System.Security.Claims;
using backend.Controllers;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace backend.Tests;

public class AuthControllerTests
{
    private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
    private readonly Mock<RoleManager<IdentityRole>> _mockRoleManager;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly Mock<ILogService> _mockLogService;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<INotificationService> _mockNotificationService;
    private readonly IMemoryCache _cache; 
    private readonly ApplicationDbContext _context;

    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockUserManager = MockUserManager<ApplicationUser>();
        _mockRoleManager = MockRoleManager<IdentityRole>();
        
        _mockConfiguration = new Mock<IConfiguration>();
        _mockConfiguration.Setup(c => c["Jwt:Key"]).Returns("SuperTajnyKluczKtoryMaPrzynajmniej32Znaki!!!!");
        _mockConfiguration.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
        _mockConfiguration.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");
        _mockConfiguration.Setup(c => c["FrontendUrl"]).Returns("http://localhost:3000");

        _mockLogService = new Mock<ILogService>();
        _mockEmailService = new Mock<IEmailService>();
        _mockNotificationService = new Mock<INotificationService>();
        
        _cache = new MemoryCache(new MemoryCacheOptions());

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "AuthTestDb_" + Guid.NewGuid())
            .Options;
        _context = new ApplicationDbContext(options);

        _controller = new AuthController(
            _mockUserManager.Object,
            _mockRoleManager.Object,
            _mockConfiguration.Object,
            _mockLogService.Object,
            _mockEmailService.Object,
            _mockNotificationService.Object,
            _context,
            _cache
        );

        var httpContext = new DefaultHttpContext();
        httpContext.Connection.RemoteIpAddress = System.Net.IPAddress.Parse("127.0.0.1");
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };
    }

    [Fact]
    public async Task Register_ShouldSucceed_WhenDataIsCorrect()
    {
        var dto = new RegisterDto 
        { 
            Email = "new@user.com", 
            Password = "Password123!", 
            FirstName = "Jan", 
            LastName = "Kowalski", 
            ConfirmPassword = "Password123!" 
        };

        _mockUserManager.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync((ApplicationUser)null);
        _mockUserManager.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);
        _mockUserManager.Setup(x => x.GenerateEmailConfirmationTokenAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync("mock_token");

        var result = await _controller.Register(dto);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var val = okResult.Value;
        
        _mockEmailService.Verify(x => x.SendEmailAsync(dto.Email, It.IsAny<string>(), It.IsAny<string>(), null, null), Times.Once);

        _mockNotificationService.Verify(x => x.CreateNotificationAsync(It.IsAny<string>(), "Witamy w Medisure!", It.IsAny<string>(), "Informacja"), Times.Once);
    }

    [Fact]
    public async Task Login_ShouldFail_WhenPasswordIsWrong()
    {
        var user = new ApplicationUser { Id = "u1", Email = "test@test.com", EmailConfirmed = true };
        
        _mockUserManager.Setup(x => x.FindByEmailAsync("test@test.com")).ReturnsAsync(user);

        _mockUserManager.Setup(x => x.CheckPasswordAsync(user, "WrongPass")).ReturnsAsync(false);

        _mockUserManager.Setup(x => x.IsLockedOutAsync(user)).ReturnsAsync(false);

        var dto = new LoginDto { Email = "test@test.com", Password = "WrongPass" };

        var result = await _controller.Login(dto);

        result.Should().BeOfType<UnauthorizedObjectResult>();
        
        _mockUserManager.Verify(x => x.AccessFailedAsync(user), Times.Once);
    }

    [Fact]
    public async Task Login_ShouldSucceed_WhenCredentialsAreCorrect()
    {
        var user = new ApplicationUser 
        { 
            Id = "u1", 
            Email = "valid@test.com", 
            UserName = "valid@test.com",
            EmailConfirmed = true,
            FirstName = "Jan" 
        };

        _mockUserManager.Setup(x => x.FindByEmailAsync(user.Email)).ReturnsAsync(user);
        _mockUserManager.Setup(x => x.CheckPasswordAsync(user, "GoodPass")).ReturnsAsync(true);
        _mockUserManager.Setup(x => x.IsLockedOutAsync(user)).ReturnsAsync(false);
        _mockUserManager.Setup(x => x.GetRolesAsync(user)).ReturnsAsync(new List<string> { "User" });
        _mockUserManager.Setup(x => x.GetTwoFactorEnabledAsync(user)).ReturnsAsync(false);

        var dto = new LoginDto { Email = "valid@test.com", Password = "GoodPass" };

        var result = await _controller.Login(dto);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var json = System.Text.Json.JsonSerializer.Serialize(okResult.Value);
        json.Should().Contain("Token");
    }

    public static Mock<UserManager<TUser>> MockUserManager<TUser>() where TUser : class
    {
        var store = new Mock<IUserStore<TUser>>();
        var mgr = new Mock<UserManager<TUser>>(
            store.Object, 
            Mock.Of<IOptions<IdentityOptions>>(), 
            Mock.Of<IPasswordHasher<TUser>>(), 
            new IUserValidator<TUser>[0], 
            new IPasswordValidator<TUser>[0], 
            Mock.Of<ILookupNormalizer>(), 
            Mock.Of<IdentityErrorDescriber>(), 
            Mock.Of<IServiceProvider>(), 
            Mock.Of<ILogger<UserManager<TUser>>>());
        
        mgr.Object.UserValidators.Add(new UserValidator<TUser>());
        mgr.Object.PasswordValidators.Add(new PasswordValidator<TUser>());
        return mgr;
    }

    public static Mock<RoleManager<TRole>> MockRoleManager<TRole>() where TRole : class
    {
        var store = new Mock<IRoleStore<TRole>>();
        return new Mock<RoleManager<TRole>>(
            store.Object, 
            new IRoleValidator<TRole>[0], 
            Mock.Of<ILookupNormalizer>(), 
            Mock.Of<IdentityErrorDescriber>(), 
            Mock.Of<ILogger<RoleManager<TRole>>>());
    }
}