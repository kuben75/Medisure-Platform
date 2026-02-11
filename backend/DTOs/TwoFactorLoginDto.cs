using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;
public class TwoFactorLoginDto
{
    [Required] 
    public string Email { get; set; } = null!;
    [Required] 
    public string Code { get; set; } = null!;
    [Required]
    public string Password { get; set; } = null!;
}