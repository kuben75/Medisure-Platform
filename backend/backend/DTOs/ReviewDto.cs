using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class ReviewDto
{
    public int Id { get; set; }
    
    public string UserName { get; set; } 
    
    [Range(1, 5)]
    public int Rating { get; set; }
    
    [MaxLength(500)]
    public string Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsApproved { get; set; }
}