using System.Collections.Generic;

namespace backend.Models
{
    public class Package
    {
        public int Id { get; set; } 
        
        public string Name { get; set; } = null!;
        
        public decimal PriceValue { get; set; }
        public string Price { get; set; } = null!;
        
        public string Description { get; set; } = null!;
        
        public string Category { get; set; }  = null!;

        public bool HasDentalCare { get; set; } 
        public bool HasHospitalization { get; set; }
        public bool HasRehabilitation { get; set; } 
        
        public int SpecialistsCount { get; set; } 
        public int FacilitiesCount { get; set; } 
        
        
        public string Features { get; set; } = string.Empty;
        
        public string IncludedSpecializations { get; set; } = null!;
        
        public double AverageRating { get; set; } 
        public int Reviews { get; set; } 
        
        public bool? IsFeatured { get; set; } 
    }
}