using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.Models;
using backend.Services;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

public class TokenServiceTests
{
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly TokenService _sut; 

    public TokenServiceTests()
    {
        _configurationMock = new Mock<IConfiguration>();
        
        _configurationMock.Setup(c => c["Jwt:Key"]).Returns("SuperTajnyKluczKtoryMaPrzynajmniej32Znaki123!");
        _configurationMock.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
        _configurationMock.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");

        _sut = new TokenService(_configurationMock.Object);
    }

    [Fact]
    public void GenerateJwtToken_ShouldReturnValidTokenString_WhenDataIsCorrect()
    {
        var user = new ApplicationUser
        {
            Id = "user1",
            Email = "jan@test.com",
            FirstName = "Jan"
        };
        var roles = new List<string> { "Admin", "User" };

        var token = _sut.GenerateJwtToken(user, roles);

        token.Should().NotBeNullOrEmpty();
        
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        jwtToken.Issuer.Should().Be("TestIssuer");
        jwtToken.Audiences.Should().Contain("TestAudience");
        
        jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value.Should().Be("user1");
        jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value.Should().Be("jan@test.com");
        jwtToken.Claims.First(c => c.Type == "firstName").Value.Should().Be("Jan");

        var roleClaims = jwtToken.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();
        roleClaims.Should().HaveCount(2);
        roleClaims.Should().Contain("Admin");
        roleClaims.Should().Contain("User");
    }

    [Fact]
    public void GenerateJwtToken_ShouldHandleNullValues_WithoutThrowingException()
    {
      
        var user = new ApplicationUser
        {
            Id = "user2",
            Email = null,     
            FirstName = null! 
        };
        var roles = new List<string>();
        
        var token = _sut.GenerateJwtToken(user, roles);

        token.Should().NotBeNullOrEmpty();

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);


        jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value.Should().Be("");
        jwtToken.Claims.FirstOrDefault(c => c.Type == "firstName")?.Value.Should().Be("");
    }
}