namespace backend.Models;
public class ChatMessage
{
    public int Id { get; set; }

    public string Sender { get; set; } 
    
    public string Receiver { get; set; }

    public string Message { get; set; }
        
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public string UserId { get; set; }
        
    public bool IsRead { get; set; } = false;
}