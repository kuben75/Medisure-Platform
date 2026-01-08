export const calculatePersonalizedPrice = (basePrice: number, category: string, age: number | null): number => {
    if (age === null) return basePrice;
    if (!basePrice) return 0;


    if (category === 'Biznesowy' || category === 'Senior') {
        return basePrice;
    }

    let multiplier = 1.0;

    if (age > 30 && age <= 50)
        multiplier += (age - 30) * 0.015;
     else if (age > 50)
        multiplier += 0.30 + (age - 50) * 0.025;


    return Math.round(basePrice * multiplier);
}

export const getCategoryBadgeStyle = (category: string): string => {
    switch(category) {
        case 'Indywidualny': return 'bg-blue-100 text-blue-700';
        case 'Rodzinny': return 'bg-purple-100 text-purple-700';
        case 'Senior': return 'bg-green-100 text-green-700';
        case 'Biznesowy': return 'bg-gray-100 text-gray-700';
        default: return 'bg-slate-100 text-slate-600';
    }
}