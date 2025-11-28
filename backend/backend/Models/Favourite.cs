namespace backend.Models;
using System.ComponentModel.DataAnnotations.Schema;

public class Favorite
{
    public int Id { get; set; }

    public string UserId { get; set; }
    [ForeignKey("UserId")]
    public ApplicationUser User { get; set; }

    public int PackageId { get; set; }
    [ForeignKey("PackageId")]
    public Package Package { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}