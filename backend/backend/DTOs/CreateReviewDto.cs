using System.ComponentModel.DataAnnotations;
namespace backend.DTOs;

public class CreateReviewDto
{
    public int PackageId { get; set; }
        
    [Range(1, 5, ErrorMessage = "Ocena musi być między 1 a 5")]
    public int Rating { get; set; }
        
    [Required(ErrorMessage = "Komentarz jest wymagany")]
    [MinLength(10, ErrorMessage = "Komentarz musi mieć min. 10 znaków")]
    public string Comment { get; set; }
}