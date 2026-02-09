using System.ComponentModel.DataAnnotations;
namespace backend.DTOs;

public class SubscribeDto
{
    public string Duration { get; set; } = "1y";
    [Required] public string BillingPeriod { get; set; } 
    
    [Required(ErrorMessage = "Ulica jest wymagana.")]
    public string Street { get; set; }
    
    [Required(ErrorMessage = "Numer domu jest wymagany.")]
    public string HouseNumber { get; set; }
    
    [Required(ErrorMessage = "Miasto jest wymagane.")]
    public string City { get; set; }
    [Required(ErrorMessage = "Kod pocztowy jest wymagany.")]
    [RegularExpression(@"^\d{2}-\d{3}$", ErrorMessage = "Nieprawidłowy format kodu pocztowego (wymagany: XX-XXX).")]
    public string ZipCode { get; set; }
    
    [RegularExpression(@"^(\+48)?\s?\d{3}\s?\d{3}\s?\d{3}$", ErrorMessage = "Nieprawidłowy format numeru telefonu.")]
    public string Phone { get; set; }

    [Required] 
    public string PaymentMethod { get; set; }
    [Required] 
    public string TransactionId { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    [Required(ErrorMessage = "Numer PESEL jest wymagany do zawarcia umowy.")]
    [RegularExpression(@"^\d{11}$", ErrorMessage = "PESEL musi składać się z 11 cyfr.")]
    public string Pesel { get; set; }
    public DateTime? BirthDate { get; set; }
}