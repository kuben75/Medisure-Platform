using backend.Data;
using backend.Models;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Tests;

public class FavoritesServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ILogService> _logServiceMock;
    private readonly Mock<ILogger<FavoritesService>> _loggerMock;
    private readonly FavoritesService _sut; 

    public FavoritesServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new ApplicationDbContext(options);

        _logServiceMock = new Mock<ILogService>();
        _loggerMock = new Mock<ILogger<FavoritesService>>();

        _sut = new FavoritesService(_context, _logServiceMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task ToggleFavoriteAsync_ShouldAddFavorite_WhenItDoesNotExist()
    {
        var userId = "user1";
        var packageId = 1;
        
        _context.Packages.Add(new Package 
        { 
            Id = packageId, 
            Name = "Pakiet Testowy", 
            Price = "100 zł",        
            PriceValue = 100.00m,    
            Description = "Opis", 
            Category = "Zdrowie",
            IncludedSpecializations = "Internista;Okulista" 
        });
        await _context.SaveChangesAsync();

        var result = await _sut.ToggleFavoriteAsync(packageId, userId, "Jan");

        result.IsFavorite.Should().BeTrue();
        result.Message.Should().Contain("Dodano");

        var dbRecord = await _context.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.PackageId == packageId);
        dbRecord.Should().NotBeNull();
        
        _logServiceMock.Verify(x => x.LogAsync("DODAJ_ULUBIONE", It.IsAny<string>(), "Jan", userId, "Info", false), Times.Once);
    }

    [Fact]
    public async Task ToggleFavoriteAsync_ShouldRemoveFavorite_WhenItAlreadyExists()
    {
        var userId = "user1";
        var packageId = 1;

        var package = new Package 
        { 
            Id = packageId, 
            Name = "Pakiet Testowy", 
            Price = "100 zł", 
            PriceValue = 100.00m,
            Description = "D", 
            Category = "C",
            IncludedSpecializations = "Test" 
        };
        _context.Packages.Add(package);
        
        _context.Favorites.Add(new Favorite { UserId = userId, PackageId = packageId });
        await _context.SaveChangesAsync();

        var result = await _sut.ToggleFavoriteAsync(packageId, userId, "Jan");

        result.IsFavorite.Should().BeFalse();
        result.Message.Should().Contain("Usunięto");
        
        var dbRecord = await _context.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.PackageId == packageId);
        dbRecord.Should().BeNull();
        
        _logServiceMock.Verify(x => x.LogAsync("USUN_ULUBIONE", It.IsAny<string>(), "Jan", userId, "Info", false), Times.Once);
    }

    [Fact]
    public async Task ToggleFavoriteAsync_ShouldThrowException_WhenPackageDoesNotExist()
    {
        var userId = "user1";
        var nonExistentPackageId = 999; 

        Func<Task> act = async () => await _sut.ToggleFavoriteAsync(nonExistentPackageId, userId, "Jan");

        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Pakiet nie istnieje.");
    }

    [Fact]
    public async Task GetUserFavoritesAsync_ShouldReturnOnlyUserFavorites()
    {
        var userId = "myUser";
        var otherUserId = "otherUser";

        var p1 = new Package { Id = 1, Name = "P1", Price = "10 zł", PriceValue = 10m, Description = "D", Category = "C", IncludedSpecializations = "" };
        var p2 = new Package { Id = 2, Name = "P2", Price = "20 zł", PriceValue = 20m, Description = "D", Category = "C", IncludedSpecializations = "" };
        var p3 = new Package { Id = 3, Name = "P3", Price = "30 zł", PriceValue = 30m, Description = "D", Category = "C", IncludedSpecializations = "" }; 
        
        _context.Packages.AddRange(p1, p2, p3);

        _context.Favorites.AddRange(
            new Favorite { UserId = userId, PackageId = 1 },      
            new Favorite { UserId = userId, PackageId = 2 },      
            new Favorite { UserId = otherUserId, PackageId = 3 }  
        );
        await _context.SaveChangesAsync();
        
        var result = await _sut.GetUserFavoritesAsync(userId);

        result.Should().HaveCount(2);
        result.Should().Contain(p => p.Id == 1);
        result.Should().Contain(p => p.Id == 2);
        result.Should().NotContain(p => p.Id == 3);
    }

    [Fact]
    public async Task IsFavoriteAsync_ShouldReturnCorrectStatus()
    {
        var userId = "user1";
        var packageId = 5;
        
        _context.Favorites.Add(new Favorite { UserId = userId, PackageId = packageId });
        await _context.SaveChangesAsync();

        var isFav = await _sut.IsFavoriteAsync(packageId, userId);
        var isNotFav = await _sut.IsFavoriteAsync(999, userId); 

        isFav.Should().BeTrue();
        isNotFav.Should().BeFalse();
    }
}