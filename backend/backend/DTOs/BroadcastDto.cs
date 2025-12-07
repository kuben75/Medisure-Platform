namespace backend.DTOs;

public class BroadcastDto
{
    public string Title { get; set; }
    public string Message { get; set; }
    public string Type { get; set; } = "Info"; 
}