using backend.Data;
using backend.Models;
using backend.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace backend.Tests;

public class LogServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly LogService _service;

    public LogServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "LogDb_" + Guid.NewGuid())
            .Options;
        _context = new ApplicationDbContext(options);

        _service = new LogService(_context);
    }

    [Fact]
    public async Task LogAsync_ShouldSaveLogToDatabase_WhenDataIsCorrect()
    {
        string action = "TEST_ACTION";
        string desc = "Test description";
        string user = "test@user.com";
        string userId = "user-123";

        await _service.LogAsync(action, desc, user, userId, "Info", false);

        var log = await _context.SystemLogs.FirstOrDefaultAsync();

        log.Should().NotBeNull();
        log!.Action.Should().Be(action);        
        log.UserName.Should().Be(user);
        log.Level.Should().Be("Info");
        log.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
    }

    [Fact]
    public async Task LogAsync_ShouldDefaultToSystem_WhenUserNameIsNull()
    {
        
        string? nullUserName = null;
        
        await _service.LogAsync("AUTO_ACTION", "Desc", nullUserName!, "uid-123");

        var log = await _context.SystemLogs.FirstOrDefaultAsync();
        
        log.Should().NotBeNull();
        log!.UserName.Should().Be("System"); 
    }

    [Fact]
    public async Task LogAsync_ShouldHandleNullUserId()
    {
        string? nullUserId = null;

        await _service.LogAsync("ACTION", "Desc", "User", nullUserId, "Error");

        var log = await _context.SystemLogs.FirstOrDefaultAsync();
        
        log.Should().NotBeNull();
        log!.UserId.Should().BeNull(); 
        log.Level.Should().Be("Error");
    }

    [Fact]
    public async Task LogAsync_ShouldMarkAsSensitive_WhenFlagIsTrue()
    {
        
        await _service.LogAsync("SENSITIVE_ACTION", "Secret Data", "Admin", "1", "Warning", true);

        var log = await _context.SystemLogs.FirstOrDefaultAsync();
        
        log.Should().NotBeNull();
        log!.IsSensitive.Should().BeTrue();
    }
}