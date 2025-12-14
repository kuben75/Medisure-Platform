namespace backend.Services;
using backend.Models;
public interface IPricingService
{
    decimal CalculateFinalPrice(decimal baseMonthlyPrice, string optionId, string billingPeriod);
    decimal CalculateBasePriceWithRiskFactor(decimal basePackagePrice, string category, DateTime? birthDate);
    List<SubscriptionOption> GetOptions();
    SubscriptionOption GetOption(string id);    
}