using backend.Controllers;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;

namespace backend.Tests;

public class AdminControllerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<RoleManager<IdentityRole>> _roleManagerMock;
    private readonly Mock<ILogService> _logServiceMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly AdminController _sut; 

    public AdminControllerTests()
    {
        
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);

        var userStore = new Mock<IUserStore<ApplicationUser>>();
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(userStore.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        var roleStore = new Mock<IRoleStore<IdentityRole>>();
        _roleManagerMock = new Mock<RoleManager<IdentityRole>>(roleStore.Object, null!, null!, null!, null!);

        _logServiceMock = new Mock<ILogService>();
        _emailServiceMock = new Mock<IEmailService>();
        _configurationMock = new Mock<IConfiguration>();

        _sut = new AdminController(
            _userManagerMock.Object, _roleManagerMock.Object, _context,
            _logServiceMock.Object, _emailServiceMock.Object, _configurationMock.Object
        );
    }

    private void SetupAdminContext(string adminId, string role = "Admin")
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, adminId),
            new Claim(ClaimTypes.Name, "AdminUser"),
            new Claim(ClaimTypes.Role, role)
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);

        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task GetDashboardStats_ShouldReturnCorrectCounts()
    {
        _context.Users.AddRange(
            new ApplicationUser { Id="u1", FirstName="A", LastName="B", Email="a@a.com" }, 
            new ApplicationUser { Id="u2", FirstName="C", LastName="D", Email="b@b.com" });
        
        _context.Packages.Add(new Package { Id=1, Name="P", Price="10", Description="D", Category="C", IncludedSpecializations="", Features="" });
        
        _context.UserPackages.Add(new UserPackage { 
            UserId="u1", PackageId=1, Status="Active", EndDate=DateTime.UtcNow.AddDays(10), 
            User=null!, Package=null!, PriceAtPurchase="", Street="", HouseNumber="", City="", ZipCode="", PaymentMethod="", TransactionId="", Pesel="" 
        });

        await _context.SaveChangesAsync();

        var result = await _sut.GetDashboardStats();

        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var stats = okResult.Value.Should().BeOfType<DashboardStatsDto>().Subject;

        stats.TotalUsers.Should().Be(2);
        stats.TotalPackagesAvailable.Should().Be(1);
        stats.ActiveSubscriptions.Should().Be(1);
    }

    [Fact]
    public async Task LockUser_ShouldSucceed_WhenAdminLocksRegularUser()
    {
        var adminId = "admin1";
        var targetId = "user1";
        SetupAdminContext(adminId);

        var adminUser = new ApplicationUser { Id = adminId };
        var targetUser = new ApplicationUser { Id = targetId, Email = "user@test.com", FirstName = "Jan" };

        _userManagerMock.Setup(x => x.FindByIdAsync(adminId)).ReturnsAsync(adminUser);
        _userManagerMock.Setup(x => x.FindByIdAsync(targetId)).ReturnsAsync(targetUser);
        
        _userManagerMock.Setup(x => x.IsInRoleAsync(adminUser, "SuperAdmin")).ReturnsAsync(false);
        _userManagerMock.Setup(x => x.IsInRoleAsync(targetUser, "Admin")).ReturnsAsync(false);
        _userManagerMock.Setup(x => x.IsInRoleAsync(targetUser, "SuperAdmin")).ReturnsAsync(false);

        _userManagerMock.Setup(x => x.SetLockoutEndDateAsync(targetUser, It.IsAny<DateTimeOffset>()))
            .ReturnsAsync(IdentityResult.Success);

        var dto = new LockUserDto { Reason = "Spam" };

        var result = await _sut.LockUser(targetId, dto);

        result.Should().BeOfType<OkObjectResult>();
        _emailServiceMock.Verify(x => x.SendEmailAsync(targetUser.Email, "Ważne: Twoje konto zostało zablokowane", It.IsAny<string>(), null, null), Times.Once);
    }

    [Fact]
    public async Task LockUser_ShouldFail_WhenAdminTriesToLockSelf()
    {
        var adminId = "admin1";
        SetupAdminContext(adminId);
        
        var adminUser = new ApplicationUser { Id = adminId };
        _userManagerMock.Setup(x => x.FindByIdAsync(adminId)).ReturnsAsync(adminUser);

        var dto = new LockUserDto { Reason = "Samobójstwo" };

        var result = await _sut.LockUser(adminId, dto);

        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var error = badRequest.Value as ErrorResponse;
        error!.Message.Should().Contain("Nie możesz zablokować samego siebie");
    }

    [Fact]
    public async Task LockUser_ShouldFail_WhenAdminTriesToLockSuperAdmin()
    {
        var adminId = "admin1";
        var superId = "super1";
        SetupAdminContext(adminId); 

        var adminUser = new ApplicationUser { Id = adminId };
        var superUser = new ApplicationUser { Id = superId };

        _userManagerMock.Setup(x => x.FindByIdAsync(adminId)).ReturnsAsync(adminUser);
        _userManagerMock.Setup(x => x.FindByIdAsync(superId)).ReturnsAsync(superUser);

        _userManagerMock.Setup(x => x.IsInRoleAsync(adminUser, "SuperAdmin")).ReturnsAsync(false);
        _userManagerMock.Setup(x => x.IsInRoleAsync(superUser, "SuperAdmin")).ReturnsAsync(true); 

        var dto = new LockUserDto { Reason = "Zamach stanu" };

        var result = await _sut.LockUser(superId, dto);

        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var error = badRequest.Value as ErrorResponse;
        error!.Message.Should().Contain("Brak uprawnień"); 
    }

    [Fact]
    public async Task UnlockUser_ShouldSucceed_WhenPermissionsAreValid()
    {
        var adminId = "admin1";
        var targetId = "user1";
        SetupAdminContext(adminId);

        var adminUser = new ApplicationUser { Id = adminId };
        var targetUser = new ApplicationUser { Id = targetId, Email = "u@t.com", FirstName = "J" };

        _userManagerMock.Setup(x => x.FindByIdAsync(adminId)).ReturnsAsync(adminUser);
        _userManagerMock.Setup(x => x.FindByIdAsync(targetId)).ReturnsAsync(targetUser);
        
        _userManagerMock.Setup(x => x.IsInRoleAsync(targetUser, "SuperAdmin")).ReturnsAsync(false);

        _userManagerMock.Setup(x => x.SetLockoutEndDateAsync(targetUser, null))
            .ReturnsAsync(IdentityResult.Success);

        var result = await _sut.UnlockUser(targetId);
        
        result.Should().BeOfType<OkObjectResult>();
        _emailServiceMock.Verify(x => x.SendEmailAsync(targetUser.Email, It.IsAny<string>(), It.IsAny<string>(), null, null), Times.Once);
    }
}