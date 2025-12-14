using backend.Data;
using backend.Models;
using backend.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace backend.Tests;

public class SubscriptionExpirationWorkerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<INotificationService> _mockNotificationService;
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly Mock<ILogger<SubscriptionExpirationWorker>> _mockLogger;
    
    private readonly Mock<IServiceScopeFactory> _mockScopeFactory;
    private readonly Mock<IServiceProvider> _mockRootServiceProvider;

    public SubscriptionExpirationWorkerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "WorkerDb_" + Guid.NewGuid())
            .Options;
        _context = new ApplicationDbContext(options);

        _mockEmailService = new Mock<IEmailService>();
        _mockNotificationService = new Mock<INotificationService>();
        _mockConfig = new Mock<IConfiguration>();
        _mockLogger = new Mock<ILogger<SubscriptionExpirationWorker>>();
        
        var mockScopedProvider = new Mock<IServiceProvider>();
        var mockScope = new Mock<IServiceScope>();

        mockScope.Setup(x => x.ServiceProvider).Returns(mockScopedProvider.Object);
        
        _mockScopeFactory = new Mock<IServiceScopeFactory>();
        _mockScopeFactory.Setup(x => x.CreateScope()).Returns(mockScope.Object);

        _mockRootServiceProvider = new Mock<IServiceProvider>();
        _mockRootServiceProvider.Setup(x => x.GetService(typeof(IServiceScopeFactory)))
            .Returns(_mockScopeFactory.Object);

        mockScopedProvider.Setup(x => x.GetService(typeof(ApplicationDbContext))).Returns(_context);
        mockScopedProvider.Setup(x => x.GetService(typeof(IEmailService))).Returns(_mockEmailService.Object);
        mockScopedProvider.Setup(x => x.GetService(typeof(INotificationService))).Returns(_mockNotificationService.Object);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldProcessExpiringSubscriptions()
    {
        // ARRANGE
        var targetDate = DateTime.UtcNow.AddDays(7).Date;

        var expiringSub = new UserPackage 
        { 
            Id = 1, 
            UserId = "user1", 
            // POPRAWKA: Dodano LastName
            User = new ApplicationUser { Id = "user1", Email = "user1@test.com", FirstName = "Jan", LastName = "Kowalski" },
            Package = new Package { Name = "Gold", Price = "100", Features = new List<string>(), Category = "Test", Description = "Desc" },
            Status = "Active", 
            EndDate = targetDate, 
            ExpirationWarningSent = false,
            City = "Poznań",
            Street = "Testowa",
            HouseNumber = "1",
            ZipCode = "60-001",
            Pesel = "12345678901",
            PaymentMethod = "Card",
            TransactionId = "TX-001",
            PriceAtPurchase = "100" 
        };

        var futureSub = new UserPackage 
        { 
            Id = 2, 
            UserId = "user2", 
            // POPRAWKA: Dodano FirstName i LastName
            User = new ApplicationUser { Id = "user2", Email = "u2@test.com", FirstName = "Adam", LastName = "Nowak" },
            Package = new Package { Name = "Silver", Price = "50", Features = new List<string>(), Category = "Test", Description = "Desc" },
            Status = "Active", 
            EndDate = targetDate.AddDays(1), 
            ExpirationWarningSent = false,
            City = "Warszawa",
            Street = "Polna",
            HouseNumber = "2",
            ZipCode = "00-001",
            Pesel = "98765432109",
            PaymentMethod = "Blik",
            TransactionId = "TX-002",
            PriceAtPurchase = "50"
        };

        var processedSub = new UserPackage 
        { 
            Id = 3, 
            UserId = "user3", 
            // POPRAWKA: Dodano FirstName i LastName
            User = new ApplicationUser { Id = "user3", Email = "u3@test.com", FirstName = "Ewa", LastName = "Wisniewska" },
            Package = new Package { Name = "Bronze", Price = "20", Features = new List<string>(), Category = "Test", Description = "Desc" },
            Status = "Active", 
            EndDate = targetDate, 
            ExpirationWarningSent = true,
            City = "Kraków",
            Street = "Wawel",
            HouseNumber = "3",
            ZipCode = "30-001",
            Pesel = "55555555555",
            PaymentMethod = "Card",
            TransactionId = "TX-003",
            PriceAtPurchase = "20"
        };

        _context.UserPackages.AddRange(expiringSub, futureSub, processedSub);
        await _context.SaveChangesAsync();

        var worker = new SubscriptionExpirationWorker(
            _mockRootServiceProvider.Object, 
            _mockLogger.Object, 
            _mockConfig.Object);

        using var cts = new CancellationTokenSource();
        cts.CancelAfter(500); 

        // ACT
        try
        {
            await worker.StartAsync(cts.Token);
            await Task.Delay(600); 
        }
        catch (TaskCanceledException)
        {
            // Oczekiwane przerwanie
        }

        // ASSERT
        _mockEmailService.Verify(x => x.SendEmailAsync(
            "user1@test.com", 
            It.IsAny<string>(), 
            It.IsAny<string>(), 
            null, null), Times.Once);

        _mockEmailService.Verify(x => x.SendEmailAsync("u2@test.com", It.IsAny<string>(), It.IsAny<string>(), null, null), Times.Never);
        _mockEmailService.Verify(x => x.SendEmailAsync("u3@test.com", It.IsAny<string>(), It.IsAny<string>(), null, null), Times.Never);

        _mockNotificationService.Verify(x => x.CreateNotificationAsync("user1", "Subskrypcja wygasa", It.IsAny<string>(), "System"), Times.Once);

        var subInDb = await _context.UserPackages.FindAsync(1);
        
        subInDb.Should().NotBeNull();
        subInDb!.ExpirationWarningSent.Should().BeTrue();
    }
}