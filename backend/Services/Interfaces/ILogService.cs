namespace backend.Services.Interfaces;

public interface ILogService
{
    Task LogAsync(string action, string description, string userName, string? userId = null, string level = "Info", bool isSensitive = false);
}