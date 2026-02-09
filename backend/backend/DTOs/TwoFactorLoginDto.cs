using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;
public class TwoFactorLoginDto
{
    [Required] 
    public string Email { get; set; }
    [Required] 
    public string Code { get; set; }
    [Required]
    public string Password { get; set; }
}