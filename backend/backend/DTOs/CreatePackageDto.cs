using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreatePackageDto
{
    [Required(ErrorMessage = "Nazwa pakietu jest wymagana")]
    public string Name { get; set; }

    [Required(ErrorMessage = "Opis jest wymagany")]
    public string Description { get; set; }

    [Required(ErrorMessage = "Kategoria jest wymagana")]
    public string Category { get; set; }

    [Range(0, 100000, ErrorMessage = "Cena musi być dodatnia")]
    public decimal PriceValue { get; set; }

    [Required]
    public string Price { get; set; } 

    public List<string> Features { get; set; } = new();
    
    public List<string> IncludedSpecializations { get; set; } = new();
    public int SpecialistsCount { get; set; }
    public int FacilitiesCount { get; set; }
    
    public bool HasDentalCare { get; set; }
    public bool HasHospitalization { get; set; }
    public bool HasRehabilitation { get; set; }
    public bool IsFeatured { get; set; }
}

public class UpdatePackageDto : CreatePackageDto { }