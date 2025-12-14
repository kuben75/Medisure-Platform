using System.Security.Claims;
using System.Text.Encodings.Web;
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
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace backend.Tests;

public class AccountControllerTests
{
    private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
    private readonly Mock<ILogService> _mockLogService;
    private readonly Mock<ApplicationDbContext> _mockContext; 
    private readonly Mock<INotificationService> _mockNotificationService;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<IConfiguration> _mockConfiguration;
    
    private readonly AccountController _controller;

    public AccountControllerTests()
    {
        _mockUserManager = MockUserManager<ApplicationUser>();

        _mockLogService = new Mock<ILogService>();
        _mockNotificationService = new Mock<INotificationService>();
        _mockEmailService = new Mock<IEmailService>();
        _mockConfiguration = new Mock<IConfiguration>();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDb_" + Guid.NewGuid().ToString())
            .Options;
        _mockContext = new Mock<ApplicationDbContext>(options);

        _controller = new AccountController(
            _mockUserManager.Object,
            _mockLogService.Object,
            _mockContext.Object, 
            _mockNotificationService.Object,
            UrlEncoder.Default, 
            _mockEmailService.Object,
            _mockConfiguration.Object
        );

        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
            new Claim(ClaimTypes.Name, "test@example.com"),
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };
    }

    [Fact]
    public async Task UpdateProfile_ShouldReturnBadRequest_WhenUserIsUnder18()
    {
        var existingUser = new ApplicationUser { Id = "test-user-id", Email = "test@example.com", BirthDate = DateTime.UtcNow.AddYears(-20) };
        
        _mockUserManager.Setup(x => x.FindByIdAsync("test-user-id"))
            .ReturnsAsync(existingUser);

        var dto = new UpdateUserDto
        {
            Email = "test@example.com", 
            FirstName = "Jan",
            LastName = "Kowalski",
            BirthDate = DateTime.UtcNow.AddYears(-10) 
        };

        var result = await _controller.UpdateProfile(dto);

        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var value = badRequestResult.Value; 

        var options = new System.Text.Json.JsonSerializerOptions
        {
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };
        var json = System.Text.Json.JsonSerializer.Serialize(value, options);

        json.Should().Contain("Musisz mieć ukończone 18 lat");
    }

    [Fact]
    public async Task UpdateProfile_ShouldReturnOk_WhenDataIsValid()
    {
        var existingUser = new ApplicationUser { Id = "test-user-id", Email = "test@example.com" };
        
        _mockUserManager.Setup(x => x.FindByIdAsync("test-user-id"))
            .ReturnsAsync(existingUser);

        _mockUserManager.Setup(x => x.UpdateAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Success);

        var dto = new UpdateUserDto
        {
            Email = "test@example.com",
            FirstName = "NoweImie",
            LastName = "NoweNazwisko",
            BirthDate = DateTime.UtcNow.AddYears(-25)
        };

        var result = await _controller.UpdateProfile(dto);

        result.Should().BeOfType<OkObjectResult>();
        
        _mockUserManager.Verify(x => x.UpdateAsync(It.Is<ApplicationUser>(u => 
            u.FirstName == "NoweImie" && 
            u.LastName == "NoweNazwisko"
        )), Times.Once);
        
        _mockLogService.Verify(x => x.LogAsync(
            "UPDATE_PROFILE",       
            It.IsAny<string>(),  
            It.IsAny<string>(),    
            It.IsAny<string>(),    
            "Info",                
            It.IsAny<bool>()       
        ), Times.Once);
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
}