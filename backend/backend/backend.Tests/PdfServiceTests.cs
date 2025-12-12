using Xunit;
using FluentAssertions;
using backend.Services;
using backend.Models;
using System;
using System.Collections.Generic; 

namespace backend.backend.Tests;
    public class PdfServiceTests
    {
        [Fact]
        public void GenerateCertificate_ShouldReturnPdfBytes_WhenAllDataIsProvided()
        {
            var service = new PdfService();

            var user = new ApplicationUser
            {
                FirstName = "Jan",
                LastName = "Testowy",
                Pesel = "90010112345"
            };

            var package = new UserPackage
            {
                TransactionId = "TRX-123456",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddYears(1),
                PriceAtPurchase = "199.00 PLN",
                PaymentMethod = "Karta",
                Street = "Testowa",
                HouseNumber = "1A",
                City = "Poznań",
                ZipCode = "60-100",
                Package = new Package
                {
                    Name = "Pakiet Złoty",
                    Features = new List<string> { "Wizyta domowa", "Badania krwi", "Dentysta" }
                }
            };

            byte[] result = service.GenerateCertificate(package, user);

            result.Should().NotBeNull(); 
            result.Length.Should().BeGreaterThan(0); 
            
            result[0].Should().Be(0x25); 
        }

        [Fact]
        public void GenerateCertificate_ShouldNotThrowError_WhenOptionalDataIsMissing()
        {
            var service = new PdfService();

            var user = new ApplicationUser
            {
                FirstName = "Anna",
                LastName = "Nowak",
                Pesel = null! 
            };

            var package = new UserPackage
            {
                TransactionId = null!, 
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddMonths(1),
                PriceAtPurchase = "50.00 PLN",
                Package = new Package
                {
                    Name = "Pakiet Start",
                    Features = null! 
                }
            };
            
            Action act = () => service.GenerateCertificate(package, user);

            act.Should().NotThrow(); 
            
            byte[] result = service.GenerateCertificate(package, user);
            result.Length.Should().BeGreaterThan(0);
        }
    }
