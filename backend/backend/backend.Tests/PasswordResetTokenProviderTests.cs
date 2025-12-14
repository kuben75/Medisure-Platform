using backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;
using backend.Models;

namespace backend.Tests;

public class PasswordResetTokenProviderTests
{
    [Fact]
    public void Options_ShouldHaveCorrectDefaults()
    {
        var options = new PasswordResetTokenProviderOptions();

        options.TokenLifespan.Should().Be(TimeSpan.FromMinutes(15));
        
        options.Name.Should().Be("PasswordResetDataProtectorTokenProvider");
    }

    [Fact]
    public void Provider_ShouldInitializeCorrectly()
    {
        var dataProtectionProviderMock = new Mock<IDataProtectionProvider>();
        
        dataProtectionProviderMock
            .Setup(x => x.CreateProtector(It.IsAny<string>()))
            .Returns(Mock.Of<IDataProtector>());

        var optionsMock = new Mock<IOptions<PasswordResetTokenProviderOptions>>();
        optionsMock.Setup(x => x.Value).Returns(new PasswordResetTokenProviderOptions());

        var loggerMock = new Mock<ILogger<DataProtectorTokenProvider<ApplicationUser>>>();

        var provider = new PasswordResetTokenProvider<ApplicationUser>(
            dataProtectionProviderMock.Object,
            optionsMock.Object,
            loggerMock.Object
        );

        provider.Should().NotBeNull();
    }
}