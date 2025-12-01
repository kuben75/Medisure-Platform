namespace backend.DTOs;
using System.ComponentModel.DataAnnotations;

public class UpdateUserDto
{
    [Required(ErrorMessage = "Imię jest wymagane")]
    [MinLength(2, ErrorMessage = "Imię musi mieć min. 2 znaki")]
    public string FirstName { get; set; }

    [Required(ErrorMessage = "Nazwisko jest wymagane")]
    [MinLength(2, ErrorMessage = "Nazwisko musi mieć min. 2 znaki")]
    public string LastName { get; set; }

    [Required(ErrorMessage = "Adres email jest wymagany")]
    [EmailAddress(ErrorMessage = "Niepoprawny format adresu email")]
    public string Email { get; set; }
    
    [Phone(ErrorMessage = "Niepoprawny format numeru telefonu")]
    public string? PhoneNumber { get; set; }
    
    public DateTime? BirthDate { get; set; }
    
    [RegularExpression(@"^\d{11}$", ErrorMessage = "PESEL musi składać się z 11 cyfr.")]
    public string? Pesel { get; set; }
    
}