namespace backend.DTOs;
using System.ComponentModel.DataAnnotations;

public class UpdateUserDto
{
    [Required(ErrorMessage = "Imię jest wymagane")]
    [MinLength(2, ErrorMessage = "Imię musi mieć min. 2 znaki")]
    public string FirstName { get; set; } = null!;

    [Required(ErrorMessage = "Nazwisko jest wymagane")]
    [MinLength(2, ErrorMessage = "Nazwisko musi mieć min. 2 znaki")]
    public string LastName { get; set; } = null!;

    [Required(ErrorMessage = "Adres email jest wymagany")]
    [EmailAddress(ErrorMessage = "Niepoprawny format adresu email")]
    public string Email { get; set; } = null!;
    
    [Phone(ErrorMessage = "Niepoprawny format numeru telefonu")]
    public string? PhoneNumber { get; set; } 
    
    public DateTime? BirthDate { get; set; }
    
    public string? CurrentPassword { get; set; }
    public string? TwoFactorCode { get; set; }
    
}