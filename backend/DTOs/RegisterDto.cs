namespace backend.DTOs;
using System.ComponentModel.DataAnnotations; 
public class RegisterDto
{
    [Required(ErrorMessage = "Imię jest wymagane")]
    public string FirstName { get; set; } = null!;

    [Required(ErrorMessage = "Nazwisko jest wymagane")]
    public string LastName { get; set; } = null!;

    [Required(ErrorMessage = "Adres email jest wymagany")]
    [EmailAddress(ErrorMessage = "Niepoprawny format adresu email")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Hasło jest wymagane")]
    public string Password { get; set; } = null!;
        

    [Compare("Password", ErrorMessage = "Hasła nie są zgodne")]
    public string ConfirmPassword { get; set; } = null!;
}