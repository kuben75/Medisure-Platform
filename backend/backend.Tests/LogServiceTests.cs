using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace backend.Tests;

public class LogServiceTests
{
    private readonly Mock<ILogger<LogService>> _loggerMock;

    public LogServiceTests()
    {
        _loggerMock = new Mock<ILogger<LogService>>();
    }

    private ApplicationDbContext GetInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task LogAsync_ShouldAddLogToDatabase_WhenCalledWithValidData()
    {
        using var context = GetInMemoryContext();
        var sut = new LogService(context, _loggerMock.Object);

        string action = "LOGIN";
        string desc = "User logged in";
        string user = "jan@test.com";
        string userId = "user-123";

        await sut.LogAsync(action, desc, user, userId);

        var log = await context.SystemLogs.FirstOrDefaultAsync();
        
        log.Should().NotBeNull();
        log!.Action.Should().Be(action);
        log.Description.Should().Be(desc);
        log.UserName.Should().Be(user);
        log.UserId.Should().Be(userId);
        log.Level.Should().Be("Info"); 
        log.IsSensitive.Should().BeFalse(); 
        
        log.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public async Task LogAsync_ShouldDefaultUserNameToSystem_WhenUserNameIsMissing(string? emptyUserName)
    {
     
        using var context = GetInMemoryContext();
        var sut = new LogService(context, _loggerMock.Object);


        await sut.LogAsync("ACTION", "DESC", emptyUserName!);

        var log = await context.SystemLogs.FirstOrDefaultAsync();
        log.Should().NotBeNull();
        log!.UserName.Should().Be("System");
    }

    [Fact]
    public async Task LogAsync_ShouldCatchExceptionAndLogCriticalError_WhenDatabaseFails()
    {
        var context = GetInMemoryContext();
        var sut = new LogService(context, _loggerMock.Object);


        context.Dispose(); 

        Func<Task> act = async () => await sut.LogAsync("FAIL", "This should fail", "User");

   
        await act.Should().NotThrowAsync();
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("[CRITICAL] Nie udało się zapisać logu")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}