namespace backend.Models;
public class ChatMessage
{
    public int Id { get; set; } 

    public string Sender { get; set; }  = null!;
    
    public string Receiver { get; set; } = null!;

    public string Message { get; set; } = null!;
        
    public DateTime Timestamp { get; set; } = DateTime.UtcNow; 

    public string UserId { get; set; } = null!;
        
    public bool IsRead { get; set; } = false; 
}