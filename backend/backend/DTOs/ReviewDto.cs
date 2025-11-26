namespace backend.DTOs;

public class ReviewDto
{
    public int Id { get; set; }
    public string UserName { get; set; } 
    public int Rating { get; set; }
    public string Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsApproved { get; set; }
}