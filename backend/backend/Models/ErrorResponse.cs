namespace backend.Models;

public class ErrorResponse
{
    public bool Success { get; set; } = false;
    public string Message { get; set; } 
    public int ErrorCode { get; set; }  
}