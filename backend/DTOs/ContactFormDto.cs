using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class ContactFormDto
{
    [Required(ErrorMessage = "Imię jest wymagane")]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "Nazwisko jest wymagane")]
    public string Surname { get; set; } = null!;

    [Required(ErrorMessage = "Email jest wymagany")]
    [EmailAddress(ErrorMessage = "Nieprawidłowy format email")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Telefon jest wymagany")]
    [RegularExpression(@"^\d{9}$", ErrorMessage = "Telefon musi składać się z 9-15 cyfr")]
    public string Phone { get; set; } = null!;

    [Required(ErrorMessage = "Temat jest wymagany")]
    public string Topic { get; set; } = null!;

    [StringLength(1000, ErrorMessage = "Wiadomość jest zbyt długa")]
    public string Message { get; set; } = null!;
}