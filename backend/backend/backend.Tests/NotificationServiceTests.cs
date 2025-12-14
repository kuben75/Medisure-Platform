using backend.Data;
using backend.Models;
using backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace backend.Tests;

public class NotificationServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
    private readonly NotificationService _service;

    public NotificationServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "NotifDb_" + Guid.NewGuid())
            .Options;
        _context = new ApplicationDbContext(options);

        _mockUserManager = MockUserManager<ApplicationUser>();

        _service = new NotificationService(_context, _mockUserManager.Object);
    }

    [Fact]
    public async Task CreateNotificationAsync_ShouldAddOneNotificationToDb()
    {
        string userId = "user1";
        string title = "Test Title";
        string msg = "Test Message";

        await _service.CreateNotificationAsync(userId, title, msg);

        var notification = await _context.SystemNotifications.FirstOrDefaultAsync();
        
        notification.Should().NotBeNull();
        notification!.UserId.Should().Be(userId);
        notification.Title.Should().Be(title);
        notification.IsRead.Should().BeFalse();
        notification.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
    }

    [Fact]
    public async Task NotifyAllAdminsAsync_ShouldCreateNotificationsOnlyForAdmins()
    {
        var admin1 = new ApplicationUser { Id = "admin1", Email = "a1@test.com" };
        var admin2 = new ApplicationUser { Id = "admin2", Email = "a2@test.com" };
        var adminsList = new List<ApplicationUser> { admin1, admin2 };

        _mockUserManager.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(adminsList);

        await _service.NotifyAllAdminsAsync("Alert", "Admin Message");

        var count = await _context.SystemNotifications.CountAsync();
        count.Should().Be(2);

        var notif1 = await _context.SystemNotifications.FirstOrDefaultAsync(n => n.UserId == "admin1");
        notif1.Should().NotBeNull();
        notif1!.Message.Should().Be("Admin Message");
    }

    [Fact]
    public async Task NotifyAllAdminsAsync_ShouldDoNothing_WhenNoAdminsExist()
    {
        _mockUserManager.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<ApplicationUser>());

        await _service.NotifyAllAdminsAsync("Alert", "Msg");

        var count = await _context.SystemNotifications.CountAsync();
        count.Should().Be(0);
    }

    [Fact]
    public async Task BroadcastToAllUsersAsync_ShouldNotifyEveryoneInDb()
    {
        _context.Users.Add(new ApplicationUser { Id = "u1", Email = "u1@test.com", FirstName = "F", LastName = "L" });
        _context.Users.Add(new ApplicationUser { Id = "u2", Email = "u2@test.com", FirstName = "F", LastName = "L" });
        _context.Users.Add(new ApplicationUser { Id = "u3", Email = "u3@test.com", FirstName = "F", LastName = "L" });
        await _context.SaveChangesAsync();

        await _service.BroadcastToAllUsersAsync("Broadcast", "Hello All");

        var count = await _context.SystemNotifications.CountAsync();
        count.Should().Be(3);

        var u1Notif = await _context.SystemNotifications.FirstOrDefaultAsync(n => n.UserId == "u1");
        
        u1Notif.Should().NotBeNull();
        u1Notif!.Title.Should().Be("Broadcast");
    }

    public static Mock<UserManager<TUser>> MockUserManager<TUser>() where TUser : class
    {
        var store = new Mock<IUserStore<TUser>>();
        
        return new Mock<UserManager<TUser>>(
            store.Object, 
            null!, 
            null!, 
            null!, 
            null!, 
            null!, 
            null!, 
            null!, 
            null!);
    }
}