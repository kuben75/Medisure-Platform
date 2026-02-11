using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class ReviewsServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ILogService> _logServiceMock;
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly ReviewsService _sut; 

    public ReviewsServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new ApplicationDbContext(options);
        _logServiceMock = new Mock<ILogService>();
        _notificationServiceMock = new Mock<INotificationService>();

        _sut = new ReviewsService(_context, _logServiceMock.Object, _notificationServiceMock.Object);
    }

    [Fact]
    public async Task AddReviewAsync_ShouldFail_WhenUserHasNotPurchasedPackage()
    {
        var userId = "user1";
        var packageId = 1;
        

        var dto = new CreateReviewDto { PackageId = packageId, Rating = 5, Comment = "Super" };

        var result = await _sut.AddReviewAsync(dto, userId, "email@test.com");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Możesz ocenić tylko pakiety, które posiadasz");
    }

    [Fact]
    public async Task AddReviewAsync_ShouldSuccess_WhenUserHasPurchasedPackage()
    {
        var userId = "user1";
        var packageId = 1;
        
        _context.UserPackages.Add(new UserPackage 
        { 
            UserId = userId, PackageId = packageId, Status = "Active",
            User = new ApplicationUser { Id = userId, FirstName = "A", LastName = "B" },
            Package = new Package { Id = packageId, Name = "P", PriceValue = 10, Price = "10", Description = "D", Category = "C", IncludedSpecializations = "", Features = "" },
            PriceAtPurchase = "100", Street = "S", HouseNumber = "1", City = "C", ZipCode = "00", PaymentMethod = "Card", TransactionId = "123", Pesel = "123"
        });
        await _context.SaveChangesAsync();

        var dto = new CreateReviewDto { PackageId = packageId, Rating = 5, Comment = "Polecam" };

        var result = await _sut.AddReviewAsync(dto, userId, "email@test.com");

        result.Success.Should().BeTrue();
        
        var review = await _context.Reviews.FirstOrDefaultAsync();
        review.Should().NotBeNull();
        review!.IsApproved.Should().BeFalse(); 
        review.Comment.Should().Be("Polecam");

        _notificationServiceMock.Verify(x => x.NotifyAllAdminsAsync(It.IsAny<string>(), It.IsAny<string>(), "Opinie"), Times.Once);
    }

    [Fact]
    public async Task AddReviewAsync_ShouldFail_WhenUserAlreadyReviewed()
    {
        var userId = "user1";
        var packageId = 1;
        
        _context.UserPackages.Add(new UserPackage 
        { 
            UserId = userId, PackageId = packageId, Status = "Active",
            User = new ApplicationUser { Id = userId, FirstName = "A", LastName = "B" },
            Package = new Package { Id = packageId, Name = "P", PriceValue=10, Price="10", Description="D", Category="C", IncludedSpecializations="", Features="" },
            PriceAtPurchase="100", Street="S", HouseNumber="1", City="C", ZipCode="00", PaymentMethod="C", TransactionId="1", Pesel="1"
        });
        
        _context.Reviews.Add(new Review { UserId = userId, PackageId = packageId, Rating = 5, Comment = "Old", IsApproved = true });
        
        await _context.SaveChangesAsync();

        var dto = new CreateReviewDto { PackageId = packageId, Rating = 1, Comment = "New" };

        var result = await _sut.AddReviewAsync(dto, userId, "email@test.com");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Już oceniłeś ten pakiet");
    }

    [Fact]
    public async Task ApproveReviewAsync_ShouldApproveAndRecalculateRating()
    {
        var packageId = 10;
        
        var package = new Package { Id = packageId, Name = "Pakiet", PriceValue = 100, Price = "100", Description = "D", Category = "C", IncludedSpecializations = "", Features = "", AverageRating = 0, Reviews = 0 };
        _context.Packages.Add(package);

        _context.Reviews.Add(new Review { UserId = "u1", PackageId = packageId, Rating = 5, Comment = "Super", IsApproved = true });
        
        var pendingReview = new Review { UserId = "u2", PackageId = packageId, Rating = 1, Comment = "Słabe", IsApproved = false };
        _context.Reviews.Add(pendingReview);
        
        await _context.SaveChangesAsync();

        var result = await _sut.ApproveReviewAsync(pendingReview.Id, "admin1", "Admin");

        result.Should().BeTrue();

        var dbReview = await _context.Reviews.FindAsync(pendingReview.Id);
        dbReview!.IsApproved.Should().BeTrue();
        
        var dbPackage = await _context.Packages.FindAsync(packageId);
        dbPackage!.AverageRating.Should().Be(3.0);
        dbPackage.Reviews.Should().Be(2);
    }

    [Fact]
    public async Task GetPackageReviewsAsync_ShouldReturnOnlyApprovedReviews()
    {
        var packageId = 5;
        var user = new ApplicationUser { Id = "u1", FirstName = "Jan", LastName = "Kowalski" };
        _context.Users.Add(user);

        _context.Reviews.Add(new Review { UserId = "u1", PackageId = packageId, Rating = 5, Comment = "Approved", IsApproved = true, User = user });
        _context.Reviews.Add(new Review { UserId = "u1", PackageId = packageId, Rating = 1, Comment = "Pending", IsApproved = false, User = user });
        
        await _context.SaveChangesAsync();

        var result = await _sut.GetPackageReviewsAsync(packageId);

        result.Should().HaveCount(1);
        result.First().Comment.Should().Be("Approved");
    }

    [Fact]
    public async Task RejectReviewAsync_ShouldDeleteReview()
    {
        var review = new Review { UserId = "u1", PackageId = 1, Rating = 5, Comment = "Spam", IsApproved = false };
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        var result = await _sut.RejectReviewAsync(review.Id, "admin1", "Admin");

        result.Should().BeTrue();
        var dbReview = await _context.Reviews.FindAsync(review.Id);
        dbReview.Should().BeNull();
        
        _logServiceMock.Verify(x => x.LogAsync("ODRZUCENIE_OPINII", It.IsAny<string>(), "Admin", "admin1", "Info", false), Times.Once);
    }
}