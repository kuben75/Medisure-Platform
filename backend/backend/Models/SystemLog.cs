namespace backend.Models;

public class SystemLog
{
    public int Id { get; set; }
        
    public string Action { get; set; }    
    public string Description { get; set; } 
        

    public string Level { get; set; } = "Info"; 
    public string UserName { get; set; }
    public string? UserId { get; set; }
        
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}