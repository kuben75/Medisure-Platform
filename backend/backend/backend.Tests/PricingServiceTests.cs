using Xunit;
using FluentAssertions;
using backend.Services;
using backend.Models; 
using System;

namespace backend.Tests
{
    public class PricingServiceTests
    {
        [Fact]
        public void CalculateFinalPrice_ShouldReturnOneZloty_WhenDurationIs7Days()
        {
            var service = new PricingService();
            decimal basePrice = 69.00m;

            decimal result = service.CalculateFinalPrice(basePrice, "7d", "monthly");

            result.Should().Be(1.00m);
        }

        [Fact]
        public void CalculateFinalPrice_ShouldApply5PercentDiscount_WhenPaidYearly()
        {
            var service = new PricingService();
            decimal basePrice = 100.00m; 

            decimal result = service.CalculateFinalPrice(basePrice, "yearly", "upfront");
            result.Should().Be(1140.00m);
        }

        [Fact]
        public void CalculateFinalPrice_ShouldReturnBasePrice_WhenBillingIsMonthly()
        {
            var service = new PricingService();
            decimal basePrice = 69.00m;

            decimal result = service.CalculateFinalPrice(basePrice, "yearly", "monthly");

            result.Should().Be(69.00m);
        }
    }
}