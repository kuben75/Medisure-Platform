using System.Net;
using System.Net.Mail; 
using System.Text.Json;
using backend.Enums;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace backend.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Wystąpił nieoczekiwany błąd systemu: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex, _env);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception, IHostEnvironment env)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = new ErrorResponse
        {
            Success = false,
            Message = "Wystąpił krytyczny błąd systemu.",
            ErrorCode = (int)ErrorCode.InternalServerError 
        };

        switch (exception)
        {
            case TimeoutException:
                response.ErrorCode = (int)ErrorCode.DatabaseTimeout; 
                response.Message = "Operacja trwała zbyt długo.";
                break;

            case TaskCanceledException:
                response.ErrorCode = (int)ErrorCode.TaskCanceled; 
                response.Message = "Operacja została anulowana przez system.";
                break;

            case DbUpdateException:
            case PostgresException: 
                response.ErrorCode = (int)ErrorCode.DatabaseIntegrityError; 
                response.Message = "Błąd zapisu danych. Prawdopodobnie naruszono reguły spójności.";
                break;
            
            case var ex when ex.Message.Contains("Connection") || ex.Message.Contains("npgsql") || ex.Message.Contains("network"):
                response.ErrorCode = (int)ErrorCode.DatabaseConnectionError; 
                response.Message = "Nie udało się nawiązać połączenia z bazą danych.";
                break;

            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized; 
                response.ErrorCode = (int)ErrorCode.Unauthorized; 
                response.Message = "Brak dostępu. Zaloguj się ponownie.";
                break;

            case var ex when ex.Message.Contains("locked") || ex.Message.Contains("zablokowan"):
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden; 
                response.ErrorCode = (int)ErrorCode.AccountLocked; 
                response.Message = "To konto zostało zablokowane. Skontaktuj się z obsługą.";
                break;

            case var ex when ex.Message.Contains("Forbidden") || ex.Message.Contains("uprawnień"):
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden; 
                response.ErrorCode = (int)ErrorCode.Forbidden; 
                response.Message = "Brak uprawnień do wykonania tej operacji.";
                break;

            case KeyNotFoundException:
            case FileNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound; 
                response.ErrorCode = (int)ErrorCode.NotFound; 
                response.Message = "Żądany zasób nie został odnaleziony.";
                break;

            case ArgumentNullException: 
            case FormatException: 
            case ArgumentException: 
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest; 
                response.ErrorCode = (int)ErrorCode.ValidationError; 
                response.Message = "Przesłane dane są nieprawidłowe lub niekompletne.";
                break;
            
            case SmtpException:
                response.ErrorCode = (int)ErrorCode.EmailSendingFailed; 
                response.Message = "Nie udało się wysłać wiadomości e-mail.";
                break;

            case var ex when ex.Source != null && ex.Source.ToLower().Contains("pdf"):
                response.ErrorCode = (int)ErrorCode.PdfGenerationFailed; 
                response.Message = "Wystąpił błąd podczas generowania dokumentu PDF.";
                break;
        }
        
        // if (env.IsDevelopment())
        //     response.Message += $" | DEBUG: [{exception.GetType().Name}] {exception.Message}";
        
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        return context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}