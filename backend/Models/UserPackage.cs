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

        public string PriceAtPurchase { get; set; }
        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Active"; 
        public string Street { get; set; }
        public string HouseNumber { get; set; }
        public string City { get; set; }
        public string ZipCode { get; set; }

        public string PaymentMethod { get; set; } 
        public string TransactionId { get; set; } 
        public string Pesel { get; set; }
        public bool ExpirationWarningSent { get; set; } = false;

    }
}