using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

public class SubscriptionServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ILogService> _logServiceMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<IPdfService> _pdfServiceMock;
    private readonly Mock<IPricingService> _pricingServiceMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly SubscriptionService _sut; 

    public SubscriptionServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new ApplicationDbContext(options);

        _logServiceMock = new Mock<ILogService>();
        _emailServiceMock = new Mock<IEmailService>();
        _notificationServiceMock = new Mock<INotificationService>();
        _pdfServiceMock = new Mock<IPdfService>();
        _pricingServiceMock = new Mock<IPricingService>();
        _configurationMock = new Mock<IConfiguration>();

        _pricingServiceMock.Setup(x => x.CalculateBasePriceWithRiskFactor(It.IsAny<decimal>(), It.IsAny<string>(), It.IsAny<DateTime?>()))
            .Returns(100m); 
        _pricingServiceMock.Setup(x => x.CalculateFinalPrice(It.IsAny<decimal>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(95m); 

        _pdfServiceMock.Setup(x => x.GenerateCertificate(It.IsAny<UserPackage>(), It.IsAny<ApplicationUser>()))
            .Returns(new byte[] { 0x25, 0x50, 0x44, 0x46 }); 

        _sut = new SubscriptionService(
            _context, _logServiceMock.Object, _emailServiceMock.Object,
            _notificationServiceMock.Object, _pdfServiceMock.Object,
            _pricingServiceMock.Object, _configurationMock.Object
        );
    }

    [Fact]
    public async Task SubscribeAsync_ShouldCreateSubscription_WhenDataIsCorrect()
    {
        var userId = "user1";
        var packageId = 1;
        
        var user = new ApplicationUser { Id = userId, Email = "jan@test.com", FirstName = "Jan", LastName = "Kowalski", BirthDate = DateTime.UtcNow.AddYears(-20) };
        _context.Users.Add(user);

        _context.Packages.Add(new Package 
        { 
            Id = packageId, Name = "Basic", Category = "Indywidualny", 
            PriceValue = 100, Price = "100", Description="D", IncludedSpecializations="", Features="" 
        });
        await _context.SaveChangesAsync();

        var dto = new SubscribeDto
        {
            Pesel = "90010112345",
            Duration = "12m",
            BillingPeriod = "yearly",
            StartDate = DateTime.UtcNow.AddDays(1),
            Street = "Polna", HouseNumber = "1", City = "Poznan", ZipCode = "60-100", PaymentMethod = "Blik", TransactionId = "TRX1"
        };

        var result = await _sut.SubscribeAsync(packageId, dto, userId, user.Email);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("Sukces");

        var sub = await _context.UserPackages.FirstOrDefaultAsync(u => u.UserId == userId);
        sub.Should().NotBeNull();
        sub!.Status.Should().Be("Active");
        sub.EndDate.Should().BeAfter(DateTime.UtcNow.AddMonths(11)); 

        _pdfServiceMock.Verify(x => x.GenerateCertificate(It.IsAny<UserPackage>(), It.IsAny<ApplicationUser>()), Times.Once);
        _emailServiceMock.Verify(x => x.SendEmailAsync(user.Email, It.IsAny<string>(), It.IsAny<string>(), It.IsAny<byte[]>(),It.IsAny<string>()), Times.Once);
        _notificationServiceMock.Verify(x => x.NotifyAllAdminsAsync("Nowa sprzedaż", It.IsAny<string>(), "Sales"), Times.Once);
    }

    [Fact]
    public async Task SubscribeAsync_ShouldFail_WhenUserIsUnderage()
    {
        var userId = "kid";
        _context.Users.Add(new ApplicationUser 
        { 
            Id = userId, 
            Email = "kid@test.com", 
            BirthDate = DateTime.UtcNow.AddYears(-17),
            FirstName = "Zbyt",
            LastName = "Młody"
        });
    
        _context.Packages.Add(new Package { Id = 1, Name = "P", Category = "Indywidualny", PriceValue=10, Price="10", Description="D", IncludedSpecializations="", Features="" });
        await _context.SaveChangesAsync();

        var dto = new SubscribeDto { Pesel = "05210112345", Duration = "12m", BillingPeriod = "y", StartDate = DateTime.UtcNow };

        var result = await _sut.SubscribeAsync(1, dto, userId, "kid@test.com");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Musisz mieć ukończone 18 lat");
    
        _context.UserPackages.Should().BeEmpty();
    }

    [Fact]
    public async Task SubscribeAsync_ShouldFail_WhenUserIsTooOld()
    {
        var userId = "senior";
        _context.Users.Add(new ApplicationUser 
        { 
            Id = userId, 
            Email = "s@test.com", 
            BirthDate = DateTime.UtcNow.AddYears(-100),
            FirstName = "Pan",
            LastName = "Senior"
        });
    
        _context.Packages.Add(new Package { Id = 1, Name = "P", Category = "Indywidualny", PriceValue=10, Price="10", Description="D", IncludedSpecializations="", Features="" });
        await _context.SaveChangesAsync();

        var dto = new SubscribeDto { Pesel = "23010112345", Duration = "12m", BillingPeriod = "y", StartDate = DateTime.UtcNow };


        var result = await _sut.SubscribeAsync(1, dto, userId, "s@test.com");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("nie obejmuje osób powyżej 99 roku życia");
    }

    [Fact]
    public async Task SubscribeAsync_ShouldFail_WhenPackageIsBusinessCategory()
    {
        var userId = "user1";
        _context.Users.Add(new ApplicationUser 
        { 
            Id = userId, 
            Email = "u@test.com", 
            BirthDate = DateTime.UtcNow.AddYears(-30),
            FirstName = "Jan",
            LastName = "Biznes"
        });
    
        _context.Packages.Add(new Package { Id = 1, Name = "B2B", Category = "Biznesowy", PriceValue=1000, Price="1000", Description="D", IncludedSpecializations="", Features="" });
        await _context.SaveChangesAsync();

        var dto = new SubscribeDto { Pesel = "90010112345", Duration = "12m", BillingPeriod = "y", StartDate = DateTime.UtcNow };

        var result = await _sut.SubscribeAsync(1, dto, userId, "u@test.com");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Pakiety biznesowe dostępne tylko przez kontakt");
    
        _logServiceMock.Verify(x => x.LogAsync("NIEAUTORYZOWANY_ZAKUP", It.IsAny<string>(), "System", userId, "Warning", true), Times.Once);
    }

    [Fact]
    public async Task SubscribeAsync_ShouldFail_WhenPeselIsAlreadyTakenByAnotherUser()
    {
        var userId = "user1";
        var otherUserId = "user2";
        var pesel = "90010112345";

        _context.Users.Add(new ApplicationUser { Id = otherUserId, Pesel = pesel, Email="other@t.com", FirstName="X", LastName="Y" });
        _context.Users.Add(new ApplicationUser { Id = userId, Pesel = null, Email="me@t.com", BirthDate = DateTime.UtcNow.AddYears(-30), FirstName="A", LastName="B" });
        
        _context.Packages.Add(new Package { Id = 1, Name = "P", Category = "Indywidualny", PriceValue=10, Price="10", Description="D", IncludedSpecializations="", Features="" });
        await _context.SaveChangesAsync();

        var dto = new SubscribeDto { Pesel = pesel, Duration = "12m", BillingPeriod = "y", StartDate = DateTime.UtcNow };

        var result = await _sut.SubscribeAsync(1, dto, userId, "me@t.com");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("PESEL jest już zajęty");
    }

    [Fact]
    public async Task CancelSubscriptionAsync_ShouldCancel_WhenSubscriptionIsActiveAndUserIsOwner()
    {
        var userId = "user1";
        var subId = 10;
        
        _context.Packages.Add(new Package { Id = 1, Name = "P", Category = "Indywidualny", PriceValue=10, Price="10", Description="D", IncludedSpecializations="", Features="" });
        
        _context.UserPackages.Add(new UserPackage 
        { 
            Id = subId, UserId = userId, PackageId = 1, Status = "Active", EndDate = DateTime.UtcNow.AddDays(100),
            User = new ApplicationUser { Id = userId, FirstName="A", LastName="B" },
            Package = null!, 
            PriceAtPurchase="10", Street="S", HouseNumber="1", City="C", ZipCode="0", PaymentMethod="C", TransactionId="T", Pesel="P"
        });
        await _context.SaveChangesAsync();

        var result = await _sut.CancelSubscriptionAsync(subId, userId, "Jan");

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("anulowana");

        var dbSub = await _context.UserPackages.FindAsync(subId);
        dbSub!.Status.Should().Be("Cancelled"); 
        
        _notificationServiceMock.Verify(x => x.CreateNotificationAsync(userId, "Subskrypcja anulowana",It.IsAny<string>(), "System"), Times.Once);
    }

    [Fact]
    public async Task CancelSubscriptionAsync_ShouldFail_WhenUserTriesToCancelSomeoneElseSubscription()
    {
        var myUserId = "me";
        var otherUserId = "other";
        var subId = 99;

        _context.Packages.Add(new Package { Id = 1, Name = "P", Category = "Indywidualny", PriceValue=10, Price="10", Description="D", IncludedSpecializations="", Features="" });
        
        _context.UserPackages.Add(new UserPackage 
        { 
            Id = subId, UserId = otherUserId, PackageId = 1, Status = "Active", EndDate = DateTime.UtcNow.AddDays(100),
            User = new ApplicationUser { Id = otherUserId, FirstName="O", LastName="T" },
            Package = null!,
            PriceAtPurchase="10", Street="S", HouseNumber="1", City="C", ZipCode="0", PaymentMethod="C", TransactionId="T", Pesel="P"
        });
        await _context.SaveChangesAsync();

        var result = await _sut.CancelSubscriptionAsync(subId, myUserId, "Jan");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Nie znaleziono subskrypcji"); 
        
        var dbSub = await _context.UserPackages.FindAsync(subId);
        dbSub!.Status.Should().Be("Active"); 
    }
}