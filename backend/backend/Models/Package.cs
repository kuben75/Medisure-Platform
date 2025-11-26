using System.Collections.Generic;

namespace backend.Models
{
    public class Package
    {
        public int Id { get; set; } 
        
        public string Name { get; set; }
        
        public decimal PriceValue { get; set; } 
        public string Price { get; set; } 
        
        public string Description { get; set; }
        
        public string Category { get; set; } 

        public bool HasDentalCare { get; set; } 
        public bool HasHospitalization { get; set; }
        public bool HasRehabilitation { get; set; } 
        
        public int SpecialistsCount { get; set; } 
        public int FacilitiesCount { get; set; } 
        
        
        public List<string> Features { get; set; }
        
        public double AverageRating { get; set; } 
        public int Reviews { get; set; } 
        
        public bool? IsFeatured { get; set; } 
    }
}