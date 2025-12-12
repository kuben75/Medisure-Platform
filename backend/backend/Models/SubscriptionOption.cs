namespace backend.Models;

public class SubscriptionOption
{
    public string Id { get; set; }       
    public string Label { get; set; }     
    public string Description { get; set; }
    public int Months { get; set; }     
    public decimal Discount { get; set; } 
    public bool IsRecurring { get; set; } 
}