using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class SystemNotification
{
    public int Id { get; set; }

    [Required] public string UserId { get; set; } = null!;

    [Required] public string Title { get; set; } = null!;

    [Required] public string Message { get; set; } = null!;

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string Type { get; set; } = "System";
}