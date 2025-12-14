using Xunit;
using FluentAssertions;
using backend.Services;
using backend.Models;
using System;

namespace backend.Tests;

    public class PricingServiceTests
    {
        private readonly PricingService _pricingService;

        public PricingServiceTests()
        {
            _pricingService = new PricingService();
        }

        [Fact]
        public void CalculateFinalPrice_ShouldReturnOneZloty_WhenDurationIs7Days()
        {
            decimal result = _pricingService.CalculateFinalPrice(69.00m, "7d", "monthly");

            result.Should().Be(1.00m);
        }

        [Fact]
        public void CalculateFinalPrice_ShouldReturnBasePrice_WhenBillingIsMonthly()
        {
            decimal result = _pricingService.CalculateFinalPrice(69.00m, "yearly", "monthly");

            result.Should().Be(69.00m);
        }

        [Theory]
        [InlineData(69.00, "yearly", "monthly", 69.00)]
        [InlineData(99.00, "yearly", "monthly", 99.00)]
        [InlineData(169.00, "biennial", "monthly", 169.00)] 
        [InlineData(69.00, "7d", "upfront", 1.00)]
        [InlineData(450.00, "7d", "upfront", 1.00)]
        [InlineData(100.00, "yearly", "upfront", 1140.00)] 
        [InlineData(50.00, "yearly", "upfront", 570.00)]
        
        [InlineData(100.00, "biennial", "upfront", 2040.00)]  
        [InlineData(10.00, "biennial", "upfront", 204.00)]   
        public void CalculateFinalPrice_ShouldReturnCorrectAmount(decimal basePrice, string duration, string billingPeriod, decimal expected)
        {
            var result = _pricingService.CalculateFinalPrice(basePrice, duration, billingPeriod);

            Assert.Equal(expected, result);
        }
    }
