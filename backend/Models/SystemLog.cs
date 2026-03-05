namespace backend.Models;

public class SystemLog
{
    public int Id { get; set; }
        
    public string Action { get; set; }    = null!; 
    public string Description { get; set; }  = null!;
        

    public string Level { get; set; } = "Info"; 
    public string UserName { get; set; } = null!;
    public string? UserId { get; set; } = null!;
        
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsSensitive { get; set; } = false;
}

