namespace backend.DTOs;

public class BroadcastDto
{
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string Type { get; set; } = "Info"; 
}