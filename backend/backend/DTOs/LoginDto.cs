using System.ComponentModel.DataAnnotations;
namespace backend.DTOs;

public class LoginDto
{
    [Required(ErrorMessage = "Adres email jest wymagany")]
    [EmailAddress(ErrorMessage = "Niepoprawny format adresu email")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Hasło jest wymagane")]
    public string Password { get; set; }
}