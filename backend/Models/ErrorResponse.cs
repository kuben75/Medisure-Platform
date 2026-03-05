namespace backend.Models;

public class ErrorResponse
{
    public bool Success { get; set; } = false;
    public string Message { get; set; }  = null!;
    public int ErrorCode { get; set; }
}
