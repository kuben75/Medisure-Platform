using System.Net;
using System.Net.Mail;
using backend.Enums;
using backend.Middleware;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;


namespace backend.Tests;

public class ExceptionMiddlewareTests
{
    private readonly Mock<ILogger<ExceptionMiddleware>> _loggerMock;
    private readonly Mock<IHostEnvironment> _envMock;
    
    public ExceptionMiddlewareTests()
    {
        _loggerMock = new Mock<ILogger<ExceptionMiddleware>>();
        _envMock = new Mock<IHostEnvironment>();
    }

    [Fact]
    public async Task InvokeAsync_ShouldCallNext_WhenNoExceptionThrown()
    {
        var context = new DefaultHttpContext();
        bool nextCalled = false;
        
        RequestDelegate next = (ctx) => 
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(200); 
    }

    [Theory]
    [MemberData(nameof(GetExceptionTestData))]
    public async Task InvokeAsync_ShouldHandleSpecificExceptions_Correctly(
        Exception exception, 
        int expectedStatusCode, 
        int expectedErrorCode, 
        string expectedMessagePart)
    {
        var context = new DefaultHttpContext();
        
        var memoryStream = new MemoryStream();
        context.Response.Body = memoryStream;

        RequestDelegate next = (ctx) => throw exception;

        var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be(expectedStatusCode);
        context.Response.ContentType.Should().Be("application/json");
        
        memoryStream.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();
        
        var response = System.Text.Json.JsonSerializer.Deserialize<ErrorResponse>(responseBody, 
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.ErrorCode.Should().Be(expectedErrorCode);
        response.Message.Should().Contain(expectedMessagePart);
    }
    public static IEnumerable<object[]> GetExceptionTestData()
    {
        yield return new object[] 
        { 
            new KeyNotFoundException("Nie ma"), 
            (int)HttpStatusCode.NotFound, 
            (int)ErrorCode.NotFound, 
            "nie został odnaleziony" 
        };
        
        yield return new object[] 
        { 
            new UnauthorizedAccessException("Brak wstępu"), 
            (int)HttpStatusCode.Unauthorized, 
            (int)ErrorCode.Unauthorized, 
            "Brak dostępu" 
        };

        yield return new object[] 
        { 
            new ArgumentNullException("param"), 
            (int)HttpStatusCode.BadRequest, 
            (int)ErrorCode.ValidationError, 
            "nieprawidłowe" 
        };

        yield return new object[] 
        { 
            new DbUpdateException("Błąd SQL"), 
            (int)HttpStatusCode.InternalServerError, 
            (int)ErrorCode.DatabaseIntegrityError, 
            "Błąd zapisu danych" 
        };
        
        yield return new object[] 
        { 
            new TimeoutException(), 
            (int)HttpStatusCode.InternalServerError, 
            (int)ErrorCode.DatabaseTimeout, 
            "trwała zbyt długo" 
        };
        
        yield return new object[] 
        { 
            new SmtpException(), 
            (int)HttpStatusCode.InternalServerError, 
            (int)ErrorCode.EmailSendingFailed, 
            "e-mail" 
        };
    }

    [Fact]
    public async Task InvokeAsync_ShouldHandleLockedAccountException_BasedOnMessageContent()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        RequestDelegate next = (ctx) => throw new Exception("Twoje konto jest zablokowane przez admina.");

        var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Forbidden);
        
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var body = await new StreamReader(context.Response.Body).ReadToEndAsync();

        var response = System.Text.Json.JsonSerializer.Deserialize<ErrorResponse>(body, 
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        response.Should().NotBeNull();
        response!.Message.Should().Contain("To konto zostało zablokowane");
        response.ErrorCode.Should().Be((int)ErrorCode.AccountLocked);
    }

    [Fact]
    public async Task InvokeAsync_ShouldReturnGenericError_ForUnknownExceptions()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        RequestDelegate next = (ctx) => throw new Exception("Jakiś dziwny błąd");

        var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var body = await new StreamReader(context.Response.Body).ReadToEndAsync();
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception?, string>>((v, t) => true)),
            Times.Once);
            
        var response = System.Text.Json.JsonSerializer.Deserialize<ErrorResponse>(body, 
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        response.Should().NotBeNull();
        response!.Message.Should().Contain("krytyczny błąd systemu");
    }
}