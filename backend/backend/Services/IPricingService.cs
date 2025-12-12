namespace backend.Services;
using backend.Models;
public interface IPricingService
{
    decimal CalculateFinalPrice(decimal baseMonthlyPrice, string optionId, string billingPeriod);
    List<SubscriptionOption> GetOptions();
    SubscriptionOption GetOption(string id);    
}