export const calculatePersonalizedPrice = (basePrice: number, category: string, age: number | null): number => {
    if (age === null) return basePrice;
    if (!basePrice) return 0;


    if (category === 'Business' || category === 'Senior') {
        return basePrice;
    }

    let multiplier = 1.0;

    if (age > 30 && age <= 50)
        multiplier += (age - 30) * 0.015;
     else if (age > 50)
        multiplier += 0.30 + (age - 50) * 0.025;


    return Math.round(basePrice * multiplier);
}