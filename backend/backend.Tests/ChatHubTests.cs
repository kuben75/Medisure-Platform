using backend.Data;
using backend.Hubs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace backend.Tests;

public class ChatHubTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<UserConnectionManager> _connectionsMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<ILogger<ChatHub>> _loggerMock;
    private readonly IMemoryCache _memoryCache;
    private readonly Mock<IHubCallerClients> _clientsMock;
    private readonly Mock<IClientProxy> _groupProxyMock;
    private readonly Mock<ISingleClientProxy> _callerProxyMock;
    private readonly Mock<IGroupManager> _groupsMock;
    private readonly Mock<HubCallerContext> _hubContextMock;

    private readonly ChatHub _sut; 

    public ChatHubTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);

        _connectionsMock = new Mock<UserConnectionManager>();
        _emailServiceMock = new Mock<IEmailService>();
        _configurationMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<ChatHub>>();
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
        
        _configurationMock.Setup(c => c["FrontendUrl"]).Returns("http://localhost");

        _clientsMock = new Mock<IHubCallerClients>();
        _groupProxyMock = new Mock<IClientProxy>();
        _callerProxyMock = new Mock<ISingleClientProxy>(); 
        _groupsMock = new Mock<IGroupManager>();
        _hubContextMock = new Mock<HubCallerContext>();

        _clientsMock.Setup(c => c.Group(It.IsAny<string>())).Returns(_groupProxyMock.Object);
        _clientsMock.Setup(c => c.Caller).Returns(_callerProxyMock.Object);
        _clientsMock.Setup(c => c.Client(It.IsAny<string>())).Returns(_callerProxyMock.Object);

        _sut = new ChatHub(
            _context,
            _connectionsMock.Object,
            _emailServiceMock.Object,
            _memoryCache,
            _configurationMock.Object,
            _loggerMock.Object
        )
        {
            Clients = _clientsMock.Object,
            Groups = _groupsMock.Object,
            Context = _hubContextMock.Object
        };
    }

    private void SetupHubUser(string userId, string role = "User")
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, userId), 
            new Claim(ClaimTypes.Role, role)
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);

        _hubContextMock.Setup(c => c.User).Returns(principal);
        _hubContextMock.Setup(c => c.ConnectionId).Returns("conn1");
        
    }

    [Fact]
    public async Task OnConnectedAsync_ShouldAddAdminToAdminsGroup()
    {
        SetupHubUser("admin@test.com", "Admin");
        await _sut.OnConnectedAsync();
        _groupsMock.Verify(g => g.AddToGroupAsync("conn1", "AdminsGroup", default), Times.Once);
    }

    [Fact]
    public async Task OnConnectedAsync_ShouldSendWelcomeMessage_IfUserIsNew()
    {
        var userId = "newuser@test.com";
        SetupHubUser(userId, "User");

        await _sut.OnConnectedAsync();

        _clientsMock.Verify(c => c.Group(userId), Times.Once);
        _groupProxyMock.Verify(
            c => c.SendCoreAsync(
                "ReceiveMessage", 
                It.Is<object[]>(args => args[0].ToString() == "System" && args[1].ToString()!.Contains("Witamy")), 
                default), 
            Times.Once);

        var msg = await _context.ChatMessages.FirstOrDefaultAsync();
        msg.Should().NotBeNull();
        msg!.Sender.Should().Be("System");
    }

    [Fact]
    public async Task OnConnectedAsync_ShouldNotSendWelcomeMessage_IfUserHasHistory()
    {
        var userId = "olduser@test.com";
        SetupHubUser(userId, "User");

        _context.ChatMessages.Add(new ChatMessage { UserId = userId, Message = "Hej", Sender = "User", Receiver = "System", Timestamp = DateTime.UtcNow, IsRead = true });
        await _context.SaveChangesAsync();

        await _sut.OnConnectedAsync();

        _groupProxyMock.Verify(
            c => c.SendCoreAsync(
                "ReceiveMessage", 
                It.Is<object[]>(args => args[0].ToString() == "System"), 
                default), 
            Times.Never);
    }

    [Fact]
    public async Task SendMessageToAdmin_ShouldSaveToDbAndNotifyAdmins()
    {
        var userId = "user@test.com";
        SetupHubUser(userId);
        var message = "Mam problem";

        await _sut.SendMessageToAdmin(message);

        var dbMsg = await _context.ChatMessages.LastOrDefaultAsync();
        dbMsg.Should().NotBeNull();
        dbMsg!.Message.Should().Be(message);
        dbMsg.Receiver.Should().Be("Admin");

        _clientsMock.Verify(c => c.Group("AdminsGroup"), Times.Once);
        _groupProxyMock.Verify(c => c.SendCoreAsync("ReceiveMessage", It.IsAny<object[]>(), default), Times.AtLeastOnce);
    }

    [Fact]
    public async Task SendMessageToUser_ShouldSendEmail_WhenCooldownExpired()
    {
        SetupHubUser("admin@test.com", "Admin");
        var targetUser = "client@test.com";
        var message = "Odpisuję na pytanie";

        await _sut.SendMessageToUser(targetUser, message);

        _emailServiceMock.Verify(x => x.SendEmailAsync(targetUser, It.IsAny<string>(), It.IsAny<string>(), null, null), Times.Once);

        var dbMsg = await _context.ChatMessages.LastOrDefaultAsync();
        dbMsg!.Message.Should().Be(message);
        dbMsg.Sender.Should().Be("Admin");
    }

    [Fact]
    public async Task SendMessageToUser_ShouldNotSendEmail_IfCachedRecently()
    {
        SetupHubUser("admin@test.com", "Admin");
        var targetUser = "client@test.com";
        
        _memoryCache.Set($"email_cooldown_{targetUser}", true);

        await _sut.SendMessageToUser(targetUser, "Wiadomość 2");

        _emailServiceMock.Verify(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), null, null), Times.Never);
    }
}