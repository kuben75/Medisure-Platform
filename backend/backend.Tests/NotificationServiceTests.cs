using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;


namespace backend.Tests;

public class NotificationServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly NotificationService _sut; 

    public NotificationServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new ApplicationDbContext(options);

        var userStoreMock = new Mock<IUserStore<ApplicationUser>>();
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            userStoreMock.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        _sut = new NotificationService(_context, _userManagerMock.Object);
    }

    [Fact]
    public async Task CreateNotificationAsync_ShouldAddNotificationToDatabase()
    {
        var userId = "user1";
        var title = "Test Title";
        var message = "Test Message";

        await _sut.CreateNotificationAsync(userId, title, message);

        var notification = await _context.SystemNotifications.FirstOrDefaultAsync();
        
        notification.Should().NotBeNull();
        notification!.UserId.Should().Be(userId);
        notification.Title.Should().Be(title);
    }

    [Fact]
    public async Task NotifyAllAdminsAsync_ShouldCreateNotificationsOnlyForAdmins()
    {
        var admin1 = new ApplicationUser { Id = "admin1", Email = "a1@test.com" };
        var admin2 = new ApplicationUser { Id = "admin2", Email = "a2@test.com" };
        
        _userManagerMock.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<ApplicationUser> { admin1, admin2 });

        await _sut.NotifyAllAdminsAsync("Alert", "Coś się dzieje");

        var count = await _context.SystemNotifications.CountAsync();
        count.Should().Be(2);

        var notif1 = await _context.SystemNotifications.FirstOrDefaultAsync(n => n.UserId == "admin1");
        notif1.Should().NotBeNull();
    }

    [Fact]
    public async Task GetUserNotificationsAsync_ShouldReturnLatestNotifications()
    {
        var userId = "user1";
        
        for (int i = 0; i < 10; i++)
        {
            _context.SystemNotifications.Add(new SystemNotification
            {
                UserId = userId,
                Title = $"Title {i}",
                Message = "Msg",
                CreatedAt = DateTime.UtcNow.AddMinutes(i),
                IsRead = false
            });
        }
        await _context.SaveChangesAsync();

        var result = await _sut.GetUserNotificationsAsync(userId);

     
        result.Should().HaveCount(10); 
        
        result.First().Title.Should().Be("Title 9");
    }

    [Fact]
    public async Task MarkAsReadAsync_ShouldUpdateIsRead_WhenNotificationExists()
    {
        var userId = "user1";
        var notification = new SystemNotification 
        { 
            UserId = userId, Title = "T", Message = "M", CreatedAt = DateTime.UtcNow, IsRead = false 
        };
        _context.SystemNotifications.Add(notification);
        await _context.SaveChangesAsync();

        var result = await _sut.MarkAsReadAsync(notification.Id, userId);

        result.Should().BeTrue();
        var dbNotif = await _context.SystemNotifications.FindAsync(notification.Id);
        dbNotif!.IsRead.Should().BeTrue();
    }

    [Fact]
    public async Task MarkAllAsReadAsync_ShouldUpdateAllUserNotifications()
    {
        var userId = "user1";
        _context.SystemNotifications.AddRange(
            new SystemNotification { UserId = userId, Title = "1", Message = "M", IsRead = false },
            new SystemNotification { UserId = userId, Title = "2", Message = "M", IsRead = false },
            new SystemNotification { UserId = "other", Title = "3", Message = "M", IsRead = false } 
        );
        await _context.SaveChangesAsync();

        await _sut.MarkAllAsReadAsync(userId);

        var userNotifs = await _context.SystemNotifications.Where(n => n.UserId == userId).ToListAsync();
        userNotifs.All(n => n.IsRead).Should().BeTrue(); 

        var otherNotif = await _context.SystemNotifications.FirstAsync(n => n.UserId == "other");
        otherNotif.IsRead.Should().BeFalse(); 
    }

    [Fact]
    public async Task DeleteNotificationAsync_ShouldRemoveNotification_WhenExistsAndBelongsToUser()
    {
        var userId = "user1";
        var notification = new SystemNotification 
        { 
            UserId = userId, Title = "Delete Me", Message = "M", CreatedAt = DateTime.UtcNow 
        };
        _context.SystemNotifications.Add(notification);
        await _context.SaveChangesAsync();

        var result = await _sut.DeleteNotificationAsync(notification.Id, userId);

        result.Should().BeTrue();
        
        var dbCount = await _context.SystemNotifications.CountAsync();
        dbCount.Should().Be(0);
    }
}