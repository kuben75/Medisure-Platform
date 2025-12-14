using System.Security.Claims;
using backend.Controllers;
using backend.Data;
using backend.Models;
using backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace backend.Tests;

public class FavoritesControllerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ILogService> _mockLogService;
    private readonly FavoritesController _controller;
    private const string UserId = "test-user-id";

    public FavoritesControllerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "FavDb_" + Guid.NewGuid()) 
            .Options;
        _context = new ApplicationDbContext(options);

        _mockLogService = new Mock<ILogService>();

        _controller = new FavoritesController(_context, _mockLogService.Object);

        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, UserId),
            new Claim(ClaimTypes.Name, "TestUser")
        }, "mock"));

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    [Fact]
    public async Task ToggleFavorite_ShouldAddFavorite_WhenNotExists()
    {
        var packageId = 1;
        _context.Packages.Add(new Package { Id = packageId, Name = "Test Package", Price = "100", Description = "Desc", Category = "Cat", Features = new List<string>() });
        await _context.SaveChangesAsync();

        var result = await _controller.ToggleFavorite(packageId);

    
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        
        var favInDb = await _context.Favorites.FirstOrDefaultAsync(f => f.UserId == UserId && f.PackageId == packageId);
        favInDb.Should().NotBeNull();
        
        _mockLogService.Verify(x => x.LogAsync(It.Is<string>(s => s == "ADD_FAVORITE"), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), "Info", false), Times.Once);
    }

    [Fact]
    public async Task ToggleFavorite_ShouldRemoveFavorite_WhenAlreadyExists()
    {
        var packageId = 1;
        _context.Packages.Add(new Package { Id = packageId, Name = "Test Package", Price = "100", Description = "Desc", Category = "Cat", Features = new List<string>() });

        _context.Favorites.Add(new Favorite { UserId = UserId, PackageId = packageId });
        await _context.SaveChangesAsync();

        var result = await _controller.ToggleFavorite(packageId);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        
        var favInDb = await _context.Favorites.FirstOrDefaultAsync(f => f.UserId == UserId && f.PackageId == packageId);
        favInDb.Should().BeNull(); 

        _mockLogService.Verify(x => x.LogAsync(It.Is<string>(s => s == "REMOVE_FAVORITE"), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), "Info", false), Times.Once);
    }

    [Fact]
    public async Task GetMyFavorites_ShouldReturnOnlyUserFavorites()
    {
        var pkg1 = new Package { Id = 1, Name = "P1", Price = "10", Description = "D", Category = "C", Features = newList() };
        var pkg2 = new Package { Id = 2, Name = "P2", Price = "20", Description = "D", Category = "C", Features = newList() };
        _context.Packages.AddRange(pkg1, pkg2);

        _context.Favorites.Add(new Favorite { UserId = UserId, PackageId = 1 });
        _context.Favorites.Add(new Favorite { UserId = "other-user", PackageId = 2 });
        
        await _context.SaveChangesAsync();

        var result = await _controller.GetMyFavorites();

        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var favorites = okResult.Value.Should().BeAssignableTo<IEnumerable<Package>>().Subject;

        favorites.Should().HaveCount(1);
        favorites.First().Name.Should().Be("P1");
    }

    [Fact]
    public async Task IsFavorite_ShouldReturnTrue_IfFavoriteExists()
    {
        _context.Favorites.Add(new Favorite { UserId = UserId, PackageId = 99 });
        await _context.SaveChangesAsync();

        var result = await _controller.IsFavorite(99);

        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().Be(true);
    }

    [Fact]
    public async Task IsFavorite_ShouldReturnFalse_IfFavoriteDoesNotExist()
    {
        var result = await _controller.IsFavorite(99);

        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().Be(false);
    }
    
    private List<string> newList() => new List<string>();
}