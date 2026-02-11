using backend.Services;

namespace backend.Tests;

public class PricingServiceTests
{
    private readonly PricingService _sut; 

    public PricingServiceTests()
    {
        _sut = new PricingService();
    }

    [Fact]
    public void GetOptions_ShouldReturnThreeDefinedOptions()
    {
        var result = _sut.GetOptions();

        result.Should().HaveCount(3);
        result.Should().Contain(o => o.Id == "yearly");
        result.Should().Contain(o => o.Id == "biennial");
        result.Should().Contain(o => o.Id == "7d");
    }

    [Theory]
    [InlineData(100, "7d", "upfront", 1.00)]       
    [InlineData(100, "yearly", "monthly", 100.0)] 
    [InlineData(100, "yearly", "upfront", 1140.0)] 
    [InlineData(100, "biennial", "upfront", 2040.0)] 
    public void CalculateFinalPrice_ShouldApplyCorrectDiscounts(decimal basePrice, string durationId, string billing, decimal expected)
    {
        var result = _sut.CalculateFinalPrice(basePrice, durationId, billing);

        result.Should().Be(expected);
    }

    [Fact]
    public void CalculateBasePriceWithRiskFactor_ShouldReturnOriginalPrice_ForNonIndividualCategory()
    {
        decimal basePrice = 100m;
        string category = "Grupowy";
        DateTime birthDate = DateTime.UtcNow.AddYears(-60); 
        
        var result = _sut.CalculateBasePriceWithRiskFactor(basePrice, category, birthDate);

        result.Should().Be(basePrice);
    }

    [Theory]
    [InlineData(25, 100, 100.00)] 
    [InlineData(40, 100, 115.00)] 
    [InlineData(50, 100, 130.00)] 
    [InlineData(60, 100, 155.00)] 
    public void CalculateBasePriceWithRiskFactor_ShouldApplyAgeMultiplierCorrectly(int age, decimal basePrice, decimal expected)
    {
        string category = "Indywidualny";
        DateTime birthDate = DateTime.UtcNow.AddYears(-age).AddDays(-1); 

        var result = _sut.CalculateBasePriceWithRiskFactor(basePrice, category, birthDate);

        result.Should().Be(expected);
    }

    [Fact]
    public void CalculateBasePriceWithRiskFactor_ShouldUseCurrentDate_WhenBirthDateIsNull()
    {
        decimal basePrice = 100m;

        var result = _sut.CalculateBasePriceWithRiskFactor(basePrice, "Indywidualny", null);

        result.Should().Be(basePrice); 
    }
}