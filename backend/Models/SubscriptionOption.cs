namespace backend.Models;

public class SubscriptionOption
{
    public string Id { get; set; }       
    public string Label { get; set; } = null!;     
    public string Description { get; set; } = null!;
    public int Months { get; set; }     
    public decimal Discount { get; set; } 
    public bool IsRecurring { get; set; } 
}