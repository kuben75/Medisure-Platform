namespace backend.Models;
using System.ComponentModel.DataAnnotations.Schema;

public class Review
{
    public int Id { get; set; }

    public string UserId { get; set; } = null!;
    [ForeignKey("UserId")]
    public ApplicationUser User { get; set; } = null!;

    public int PackageId { get; set; } 
    [ForeignKey("PackageId")]
    public Package Package { get; set; } = null!;

    public int Rating { get; set; }  
    public string Comment { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


    public bool IsApproved { get; set; } = false; 
}