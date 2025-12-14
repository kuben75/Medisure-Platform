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
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace backend.Tests;

public class AdminControllerTests
{
    private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
    private readonly Mock<ILogService> _mockLogService;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly ApplicationDbContext _context; 
    
    private readonly AdminController _controller;

    public AdminControllerTests()
    {
        _mockUserManager = MockUserManager<ApplicationUser>();

        _mockLogService = new Mock<ILogService>();
        _mockEmailService = new Mock<IEmailService>();
        _mockConfiguration = new Mock<IConfiguration>();
        _mockConfiguration.Setup(c => c["FrontendUrl"]).Returns("http://localhost:3000");

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "AdminTestDb_" + Guid.NewGuid())
            .Options;
        _context = new ApplicationDbContext(options);

        _controller = new AdminController(
            _mockUserManager.Object,
            _context,
            _mockLogService.Object,
            _mockEmailService.Object,
            _mockConfiguration.Object
        );

        SetupHttpContext("admin-id", "admin@example.com");
    }

    private void SetupHttpContext(string userId, string email)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, email)
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };
    }

    [Fact]
    public async Task GetDashboardStats_ShouldReturnCorrectCounts()
    {
        _context.Packages.Add(new Package 
        { 
            Name = "Basic", 
            Price = "100 zł",      
            PriceValue = 100,      
            Description = "Desc", 
            Category = "Test", 
            Features = new List<string>() 
        });

        _context.UserPackages.Add(new UserPackage 
        { 
            Status = "Active", 
            EndDate = DateTime.UtcNow.AddDays(10),
            UserId = "u1", PackageId = 1, PriceAtPurchase = "100", Street = "S", HouseNumber = "1", City = "C", ZipCode = "00", PaymentMethod = "Card", TransactionId = "T1", Pesel = "123"
        });
        _context.UserPackages.Add(new UserPackage 
        { 
            Status = "Expired", 
            EndDate = DateTime.UtcNow.AddDays(-1),
            UserId = "u2", PackageId = 1, PriceAtPurchase = "100", Street = "S", HouseNumber = "1", City = "C", ZipCode = "00", PaymentMethod = "Card", TransactionId = "T2", Pesel = "123"
        });
        
        _context.Users.Add(new ApplicationUser 
        { 
            Id = "u1", 
            UserName = "u1", 
            Email = "u1@test.com", 
            FirstName = "Jan",      
            LastName = "Kowalski"  
        });
        
        _context.Users.Add(new ApplicationUser 
        { 
            Id = "u2", 
            UserName = "u2", 
            Email = "u2@test.com", 
            FirstName = "Anna",    
            LastName = "Nowak"     
        });
        
        await _context.SaveChangesAsync();

        var result = await _controller.GetDashboardStats();

        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var stats = okResult.Value.Should().BeOfType<DashboardStatsDto>().Subject;

        stats.TotalPackagesAvailable.Should().Be(1);
        stats.ActiveSubscriptions.Should().Be(1);
        stats.TotalUsers.Should().Be(2); 
    }

    [Fact]
    public async Task LockUser_ShouldFail_WhenAdminTriesToLockAnotherAdmin()
    {
        var targetAdminId = "target-admin-id";
        var targetAdmin = new ApplicationUser { Id = targetAdminId, Email = "target@admin.com" };
        var currentAdmin = new ApplicationUser { Id = "my-id", Email = "me@admin.com" };

        _mockUserManager.Setup(x => x.FindByIdAsync(targetAdminId)).ReturnsAsync(targetAdmin);
        _mockUserManager.Setup(x => x.FindByEmailAsync("admin@example.com")).ReturnsAsync(currentAdmin);
        _mockUserManager.Setup(x => x.IsInRoleAsync(currentAdmin, "SuperAdmin")).ReturnsAsync(false);
        _mockUserManager.Setup(x => x.IsInRoleAsync(targetAdmin, "Admin")).ReturnsAsync(true);
        _mockUserManager.Setup(x => x.IsInRoleAsync(targetAdmin, "SuperAdmin")).ReturnsAsync(false);

        var dto = new LockUserDto { Reason = "Bo tak" };

        var result = await _controller.LockUser(targetAdminId, dto);

        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var value = badRequest.Value;
        
        var options = new System.Text.Json.JsonSerializerOptions
        {
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };
        var json = System.Text.Json.JsonSerializer.Serialize(value, options);
        
        json.Should().Contain("Brak uprawnień");
        
        _mockEmailService.Verify(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), null, null), Times.Never);
    }

    [Fact]
    public async Task GetLogs_ShouldHideSensitiveLogs_ForRegularAdmin()
    {
        _context.SystemLogs.Add(new SystemLog { Action = "LOGIN", Description = "User login", UserName = "u1", IsSensitive = false, CreatedAt = DateTime.UtcNow });
        _context.SystemLogs.Add(new SystemLog { Action = "CHANGE_ROLE", Description = "Secret admin stuff", UserName = "admin", IsSensitive = true, CreatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        var currentUser = new ApplicationUser { Id = "admin-id" };
        _mockUserManager.Setup(x => x.FindByIdAsync("admin-id")).ReturnsAsync(currentUser);
        
        _mockUserManager.Setup(x => x.IsInRoleAsync(currentUser, "SuperAdmin")).ReturnsAsync(false);

        var result = await _controller.GetLogs();

        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var logs = okResult.Value.Should().BeAssignableTo<List<SystemLog>>().Subject;

        logs.Count.Should().Be(1);
        logs.Should().Contain(l => l.Action == "LOGIN");
        logs.Should().NotContain(l => l.IsSensitive == true);
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