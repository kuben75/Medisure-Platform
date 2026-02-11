using backend.Models;
using backend.Services;
using FluentAssertions;

namespace backend.Tests;

public class PdfServiceTests
{
    private readonly PdfService _sut; 

    public PdfServiceTests()
    {

        _sut = new PdfService();
    }

    [Fact]
    public void GenerateCertificate_ShouldThrowArgumentNullException_WhenInputIsNull()
    {
        Action act1 = () => _sut.GenerateCertificate(null!, new ApplicationUser());
        Action act2 = () => _sut.GenerateCertificate(new UserPackage(), null!);

        act1.Should().Throw<ArgumentNullException>();
        act2.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void GenerateCertificate_ShouldReturnValidPdfFile_WhenDataIsCorrect()
    {
        // Arrange
        var user = new ApplicationUser
        {
            FirstName = "Jan",
            LastName = "Kowalski",
            Pesel = "90010112345"
        };

        var package = new UserPackage
        {
            TransactionId = "TRX-12345",
            StartDate = DateTime.Now,
            EndDate = DateTime.Now.AddYears(1),
            PriceAtPurchase = "100 zł",
            Street = "Polna",
            HouseNumber = "10",
            City = "Warszawa",
            ZipCode = "00-001",
            PaymentMethod = "Blik",
            Package = new Package
            {
                Name = "Pakiet Premium",
                Features = "Lekarz 24/7;Badania krwi" 
            }
        };


        var result = _sut.GenerateCertificate(package, user);


        result.Should().NotBeNull();
        result.Should().NotBeEmpty();

        result.Length.Should().BeGreaterThan(500);

 
        result[0].Should().Be(0x25); 
        result[1].Should().Be(0x50); 
        result[2].Should().Be(0x44); 
        result[3].Should().Be(0x46); 
    }
}