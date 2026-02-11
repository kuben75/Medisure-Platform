using backend.Data;
using backend.Models;
using backend.Services;
using backend.Hubs;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class ChatServiceTests
{
    private ApplicationDbContext GetDatabaseContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        var databaseContext = new ApplicationDbContext(options);
        databaseContext.Database.EnsureCreated();
        return databaseContext;
    }

    [Fact]
    public async Task MarkMessagesAsReadAsync_ShouldSetIsReadToTrue_ForReceiver()
    {
        var context = GetDatabaseContext();
        var mockManager = new Mock<UserConnectionManager>();
        var sut = new ChatService(context, mockManager.Object);

        var receiverId = "user@test.com";
        context.ChatMessages.AddRange(new List<ChatMessage>
        {
            new ChatMessage { Receiver = receiverId, IsRead = false, Message = "Hi", Sender = "Admin", UserId = receiverId },
            new ChatMessage { Receiver = "other@test.com", IsRead = false, Message = "Hi", Sender = "Admin", UserId = "other@test.com" }
        });
        await context.SaveChangesAsync();

        await sut.MarkMessagesAsReadAsync(receiverId);

        context.ChatMessages.First(m => m.Receiver == receiverId).IsRead.Should().BeTrue();
        context.ChatMessages.First(m => m.Receiver == "other@test.com").IsRead.Should().BeFalse();
    }

    [Fact]
    public async Task GetChatHistoryAsync_AsUser_ShouldReturnOnlyOwnMessages()
    {
        var context = GetDatabaseContext();
        var mockManager = new Mock<UserConnectionManager>();
        var sut = new ChatService(context, mockManager.Object);

        var userId = "my@email.com";
        context.ChatMessages.AddRange(new List<ChatMessage>
        {
            new ChatMessage { UserId = userId, Message = "My msg", Sender = userId, Receiver = "Admin" },
            new ChatMessage { UserId = "hacker@email.com", Message = "Not mine", Sender = "hacker@email.com", Receiver = "Admin" }
        });
        await context.SaveChangesAsync();

        var result = await sut.GetChatHistoryAsync(userId, false);

        result.Messages.Should().HaveCount(1);
        result.Messages.First().Message.Should().Be("My msg");
        result.Users.Should().BeEmpty(); 
    }

    [Fact]
    public async Task GetChatHistoryAsync_AsAdmin_ShouldReturnAllMessagesAndMappedUsers()
    {
        var context = GetDatabaseContext();
        var mockManager = new Mock<UserConnectionManager>();
        
        mockManager.Setup(m => m.GetOnlineUsers()).Returns(new List<string> { "jan@test.com" });
        
        var sut = new ChatService(context, mockManager.Object);
        
        context.Users.Add(new ApplicationUser { Email = "jan@test.com", FirstName = "Jan", LastName = "Kowalski" });
        
        context.ChatMessages.AddRange(new List<ChatMessage>
        {
            new ChatMessage 
            { 
                Sender = "jan@test.com", 
                Receiver = "Admin", 
                Message = "Pytanie", 
                UserId = "jan@test.com", 
                Timestamp = DateTime.UtcNow 
            },
            new ChatMessage 
            { 
                Sender = "guest_123456", 
                Receiver = "Admin", 
                Message = "Hello", 
                UserId = "guest_123456", 
                Timestamp = DateTime.UtcNow 
            }
        });
        await context.SaveChangesAsync();

     
        var result = await sut.GetChatHistoryAsync("admin@admin.com", true);

  
        result.Messages.Should().HaveCount(2);
        
        result.Users.Should().ContainKey("jan@test.com");
        result.Users["jan@test.com"].FirstName.Should().Be("Jan");

        result.Users.Should().ContainKey("guest_123456");
        result.Users["guest_123456"].FirstName.Should().Be("Gość");

        result.OnlineUsers.Should().Contain("jan@test.com");
    }

    [Fact]
    public async Task MarkUserMessagesAsReadByAdminAsync_ShouldOnlyAffectMessagesFromSpecificUser()
    {

        var context = GetDatabaseContext();
        var mockManager = new Mock<UserConnectionManager>();
        var sut = new ChatService(context, mockManager.Object);

        var targetUser = "client@test.com";
        context.ChatMessages.AddRange(new List<ChatMessage>
        {
            new ChatMessage 
            { 
                UserId = targetUser, 
                Sender = targetUser, 
                Receiver = "Admin", 
                Message = "Test message", 
                IsRead = false 
            },
            new ChatMessage 
            { 
                UserId = "other@test.com", 
                Sender = "other@test.com", 
                Receiver = "Admin", 
                Message = "Other message", 
                IsRead = false 
            }
        });
        await context.SaveChangesAsync();

        await sut.MarkUserMessagesAsReadByAdminAsync(targetUser);
        
        context.ChatMessages.First(m => m.UserId == targetUser).IsRead.Should().BeTrue();
        context.ChatMessages.First(m => m.UserId == "other@test.com").IsRead.Should().BeFalse();
    }
}