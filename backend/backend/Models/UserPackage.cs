using System.ComponentModel.DataAnnotations.Schema; 

namespace backend.Models
{
    public class UserPackage
    {
        public int Id { get; set; }

        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }

        public int PackageId { get; set; }
        [ForeignKey("PackageId")]
        public Package Package { get; set; }

        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Active"; 
        

        public string PriceAtPurchase { get; set; }
    }
}