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

public class PackagesControllerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ILogService> _mockLogService;
    private readonly Mock<IPricingService> _mockPricingService;
    private readonly PackagesController _controller;

    public PackagesControllerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "PackagesDb_" + Guid.NewGuid())
            .Options;
        _context = new ApplicationDbContext(options);

        _mockLogService = new Mock<ILogService>();
        _mockPricingService = new Mock<IPricingService>();

        _controller = new PackagesController(_context, _mockLogService.Object, _mockPricingService.Object);

        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "admin-id"),
            new Claim(ClaimTypes.Name, "AdminUser"),
            new Claim(ClaimTypes.Role, "Admin")
        }, "mock"));

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    [Fact]
    public async Task GetPackages_ShouldReturnAllPackages()
    {
        _context.Packages.Add(new Package { Id = 1, Name = "Basic", Price = "100", PriceValue = 100, Description = "D", Category = "C", Features = new List<string>() });
        _context.Packages.Add(new Package { Id = 2, Name = "Pro", Price = "200", PriceValue = 200, Description = "D", Category = "C", Features = new List<string>() });
        await _context.SaveChangesAsync();

        var result = await _controller.GetPackages();

        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var packages = okResult.Value.Should().BeAssignableTo<IEnumerable<Package>>().Subject;
        packages.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetPackage_ShouldReturnPackage_WhenIdExists()
    {
        _context.Packages.Add(new Package { Id = 1, Name = "Basic", Price = "100", PriceValue = 100, Description = "D", Category = "C", Features = new List<string>() });
        await _context.SaveChangesAsync();

        var result = await _controller.GetPackage(1);

        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var package = okResult.Value.Should().BeOfType<Package>().Subject;
        package.Name.Should().Be("Basic");
    }

    [Fact]
    public async Task GetPackage_ShouldReturnNotFound_WhenIdDoesNotExist()
    {
        var result = await _controller.GetPackage(999);

        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreatePackage_ShouldAddToDbAndLog()
    {
        var newPackage = new Package 
        { 
            Name = "New Pkg", 
            Price = "150", 
            PriceValue = 150, 
            Description = "Desc", 
            Category = "Indywidualny", 
            Features = new List<string> { "F1" } 
        };

        var result = await _controller.CreatePackage(newPackage);

        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        
        var dbPkg = await _context.Packages.FirstOrDefaultAsync(p => p.Name == "New Pkg");
        dbPkg.Should().NotBeNull();

        _mockLogService.Verify(x => x.LogAsync(It.Is<string>(s => s == "CREATE_PACKAGE"), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), "info", false), Times.Once);
    }

    [Fact]
    public async Task UpdatePackage_ShouldModifyDbAndLog()
    {
        _context.Packages.Add(new Package { Id = 1, Name = "Old Name", Price = "100", PriceValue = 100, Description = "D", Category = "C", Features = new List<string>() });
        await _context.SaveChangesAsync();

        var updateData = new Package 
        { 
            Id = 1, 
            Name = "New Name", 
            Price = "200", 
            PriceValue = 200, 
            Description = "New D", 
            Category = "C", 
            Features = new List<string>() 
        };

        var result = await _controller.UpdatePackage(1, updateData);

        result.Should().BeOfType<NoContentResult>();

        var dbPkg = await _context.Packages.FindAsync(1);
        dbPkg.Name.Should().Be("New Name"); 
        dbPkg.Price.Should().Be("200"); 

        _mockLogService.Verify(x => x.LogAsync(It.Is<string>(s => s == "UPDATE_PACKAGE"), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), "info", false), Times.Once);
    }

    [Fact]
    public async Task DeletePackage_ShouldRemoveFromDbAndLog()
    {
        _context.Packages.Add(new Package { Id = 1, Name = "To Delete", Price = "100", PriceValue = 100, Description = "D", Category = "C", Features = new List<string>() });
        await _context.SaveChangesAsync();

        var result = await _controller.DeletePackage(1);

        result.Should().BeOfType<NoContentResult>();
        
        var dbPkg = await _context.Packages.FindAsync(1);
        dbPkg.Should().BeNull(); 

        _mockLogService.Verify(x => x.LogAsync(It.Is<string>(s => s == "DELETE_PACKAGE"), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), "info", false), Times.Once);
    }

    [Fact]
    public void GetPricingOptions_ShouldReturnOptionsFromService()
    {
        var mockOptions = new List<SubscriptionOption>
        {
            new SubscriptionOption { Id = "opt1", Label = "Opcja 1" }
        };
        _mockPricingService.Setup(s => s.GetOptions()).Returns(mockOptions);

        var result = _controller.GetPricingOptions();

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedOptions = okResult.Value.Should().BeAssignableTo<List<SubscriptionOption>>().Subject;
        returnedOptions.Should().HaveCount(1);
        returnedOptions[0].Id.Should().Be("opt1");
    }
}