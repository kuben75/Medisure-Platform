using System.ComponentModel.DataAnnotations;
namespace backend.DTOs;

public class SubscribeDto
{
    public string Duration { get; set; } = "1y";
    [Required] public string BillingPeriod { get; set; }  = null!;
    
    [Required(ErrorMessage = "Ulica jest wymagana.")]
    public string Street { get; set; } = null!;
    
    [Required(ErrorMessage = "Numer domu jest wymagany.")]
    public string HouseNumber { get; set; } = null!;
    
    [Required(ErrorMessage = "Miasto jest wymagane.")]
    public string City { get; set; } = null!;
    [Required(ErrorMessage = "Kod pocztowy jest wymagany.")]
    [RegularExpression(@"^\d{2}-\d{3}$", ErrorMessage = "Nieprawidłowy format kodu pocztowego (wymagany: XX-XXX).")]
    public string ZipCode { get; set; } = null!;
    
    [RegularExpression(@"^(\+48)?\s?\d{3}\s?\d{3}\s?\d{3}$", ErrorMessage = "Nieprawidłowy format numeru telefonu.")]
    public string Phone { get; set; } = null!;

    [Required] 
    public string PaymentMethod { get; set; } = null!;
    [Required] 
    public string TransactionId { get; set; } = null!;
    
    public DateTime? StartDate { get; set; }
    
    [Required(ErrorMessage = "Numer PESEL jest wymagany do zawarcia umowy.")]
    [RegularExpression(@"^\d{11}$", ErrorMessage = "PESEL musi składać się z 11 cyfr.")]
    public string Pesel { get; set; } = null!;
    public DateTime? BirthDate { get; set; } 
}