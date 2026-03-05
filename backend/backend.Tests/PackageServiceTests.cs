using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Moq;
using FluentAssertions;

namespace backend.Tests;

public class PackageServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ILogService> _logServiceMock;
    private readonly PackageService _sut;

    public PackageServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new ApplicationDbContext(options);
        _logServiceMock = new Mock<ILogService>();

        _sut = new PackageService(_context, _logServiceMock.Object);
    }

    [Fact]
    public async Task CreatePackageAsync_ShouldMapDtoToEntityAndConvertListsToStrings()
    {
        var dto = new CreatePackageDto
        {
            Name = "Pakiet VIP",
            Description = "Full opcja",
            Category = "Premium",
            PriceValue = 500m,
            Price = "500 zł",
            IncludedSpecializations = new List<string> { "Kardiolog", "Dentysta" },
            Features = new List<string> { "24/7", "Wizyty domowe" },
            SpecialistsCount = 10,
            IsFeatured = true
        };

        var result = await _sut.CreatePackageAsync(dto, "AdminJan");

        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0); 
        
        result.IncludedSpecializations.Should().Be("Kardiolog;Dentysta");
        result.Features.Should().Be("24/7;Wizyty domowe");
        
        _logServiceMock.Verify(x => x.LogAsync("STWORZENIE_PAKIETU", It.IsAny<string>(), "AdminJan", null, "Info", false), Times.Once);
    }

    [Fact]
    public async Task UpdatePackageAsync_ShouldUpdateFields_WhenPackageExists()
    {
        var existingPackage = new Package
        {
            Name = "Stary",
            PriceValue = 100,
            IncludedSpecializations = "A",
            Features = "B",
            Description = "D", Category = "C", Price = "100"
        };
        _context.Packages.Add(existingPackage);
        await _context.SaveChangesAsync();

        var updateDto = new UpdatePackageDto
        {
            Name = "Nowy",
            Description = "Nowy Opis",
            Category = "C",
            PriceValue = 200,
            Price = "200 zł",
            IncludedSpecializations = new List<string> { "X", "Y" }, 
            Features = new List<string>()
        };

        await _sut.UpdatePackageAsync(existingPackage.Id, updateDto, "AdminJan");

        var dbPackage = await _context.Packages.FindAsync(existingPackage.Id);
        dbPackage!.Name.Should().Be("Nowy");
        dbPackage.PriceValue.Should().Be(200);
        dbPackage.IncludedSpecializations.Should().Be("X;Y");
    }

    [Fact]
    public async Task DeletePackageAsync_ShouldThrowException_WhenPackageIsUsedByUsers()
    {
       
        var packageId = 1;
    
        _context.Packages.Add(new Package 
        { 
            Id = packageId, Name = "P", Description = "D", Category = "C", 
            Price = "10", PriceValue = 10, IncludedSpecializations = "", Features = "" 
        });

        _context.UserPackages.Add(new UserPackage
        {
            UserId = "user1",
            PackageId = packageId, 
            Status = "Active",
        
            User = new ApplicationUser { Id = "user1", FirstName="A", LastName="B", Email="a@a.com" },
        
            Package = null!, 
        
            PriceAtPurchase = "100",
            Street = "Ul", HouseNumber = "1", City = "Poznan", ZipCode = "000-00", 
            PaymentMethod = "Card", TransactionId = "123", Pesel = "123"
        });
    
        await _context.SaveChangesAsync();

 
        Func<Task> act = async () => await _sut.DeletePackageAsync(packageId, "AdminJan");

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Nie można usunąć pakietu, który " +
                         "jest przypisany do użytkowników.");
        
        _logServiceMock.Verify(x => x.LogAsync("BLAD_USUNIECIA", 
            It.IsAny<string>(), 
            "AdminJan", 
            null, 
            "Error", 
            false), Times.Once);
    }

    [Fact]
    public async Task DeletePackageAsync_ShouldRemovePackage_WhenNoActiveSubscriptions()
    {
        var packageId = 5;
        _context.Packages.Add(new Package 
        { 
            Id = packageId, Name = "ToDelete", Description = "D", Category = "C", 
            Price = "10", PriceValue = 10, IncludedSpecializations = "", Features = "" 
        });
        await _context.SaveChangesAsync();

        await _sut.DeletePackageAsync(packageId, "AdminJan");

        var dbPackage = await _context.Packages.FindAsync(packageId);
        dbPackage.Should().BeNull(); 
        
        _logServiceMock.Verify(x => x.LogAsync("USUNIECIE_PAKIETU", It.IsAny<string>(), "AdminJan", null, "Info", false), Times.Once);
    }
}