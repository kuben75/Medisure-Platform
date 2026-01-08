using backend.Models;

namespace backend.Services;

public class PricingService : IPricingService
{
    
    private const string DurationYearly = "yearly";
    private const string DurationBiennial = "biennial";
    private const string Duration7Days = "7d";
    private const string BillingMonthly = "monthly";
    private const string CategoryIndividual = "Indywidualny";
    
    private readonly List<SubscriptionOption> _options = new List<SubscriptionOption>
    {
        
        new SubscriptionOption 
        { 
            Id = DurationYearly,
            Label = "1 Rok", 
            Description = "Standardowa umowa na rok.",
            Months = 12, 
            Discount = 0.05m, 
            IsRecurring = true 
        },
        new SubscriptionOption 
        { 
            Id = DurationBiennial, 
            Label = "2 Lata", 
            Description = "Długoterminowa ochrona.",
            Months = 24, 
            Discount = 0.15m, 
            IsRecurring = true 
        },
        new SubscriptionOption 
        { 
            Id = Duration7Days, 
            Label = "7 dni (test)", 
            Description = "Okres próbny",
            Months = 0, 
            Discount = 0m, 
            IsRecurring = false 
        }
    };

    public List<SubscriptionOption> GetOptions() => _options;

    public SubscriptionOption GetOption(string id) => _options.FirstOrDefault(o => o.Id == id);

    public decimal CalculateFinalPrice(decimal baseMonthlyPrice, string durationId, string billingPeriod)
    {
        if (durationId == Duration7Days) return 1.00m; 

        var option = GetOption(durationId);
        if (option == null) return baseMonthlyPrice;


        if (billingPeriod == BillingMonthly) return baseMonthlyPrice;
        
        decimal totalBase = baseMonthlyPrice * option.Months;
        
        decimal discount = option.Discount;

        decimal finalPrice = totalBase * (1 - discount);
        
        decimal rounded = Math.Round(finalPrice, 2);
        
        return rounded % 1 == 0 ? Math.Round(rounded, 0) : rounded;
    }
    public decimal CalculateBasePriceWithRiskFactor(decimal basePackagePrice, string category, DateTime? birthDate)
    {
        if (category != CategoryIndividual) 
            return basePackagePrice;

        var actualBirthDate = birthDate ?? DateTime.UtcNow;
        var age = CalculateAge(actualBirthDate);

        decimal ageMultiplier = 1.0m;

        if (age > 30 && age <= 50)
        {
            ageMultiplier += (decimal)((age - 30) * 0.015);
        }
        else if (age > 50)
        {
            ageMultiplier += 0.30m + (decimal)((age - 50) * 0.025);
        }

        return basePackagePrice * ageMultiplier;
    }
    private int CalculateAge(DateTime birthDate)
    {
        var today = DateTime.UtcNow;
        var age = today.Year - birthDate.Year;
        if (birthDate.Date > today.AddYears(-age)) age--;
        return age;
    }
}