namespace backend.DTOs;
using System.ComponentModel.DataAnnotations; 
public class RegisterDto
{
    [Required(ErrorMessage = "Imię jest wymagane")]
    public string FirstName { get; set; }

    [Required(ErrorMessage = "Nazwisko jest wymagane")]
    public string LastName { get; set; }

    [Required(ErrorMessage = "Adres email jest wymagany")]
    [EmailAddress(ErrorMessage = "Niepoprawny format adresu email")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Hasło jest wymagane")]
    public string Password { get; set; }
        

    [Compare("Password", ErrorMessage = "Hasła nie są zgodne")]
    public string ConfirmPassword { get; set; }
}