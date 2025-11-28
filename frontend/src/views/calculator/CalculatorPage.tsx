import { useState, useEffect } from 'react';
import HeroSectionCalculator from "./HeroSectionCalculator.tsx";
import CalculationResults from "./CalculationResults.tsx";
import PackageCatalog from "./PackageCalculator.tsx";
import type {IPricingPlan} from "../../types/pricing.types.ts";

const API_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/packages`

export default function CalculatorPage() {
    const [isCalculated, setIsCalculated] = useState(false);
    const [loading, setLoading] = useState(false);

    const [resultPrice, setResultPrice] = useState(0);
    const [userAge, setUserAge] = useState(0);
    const [userType, setUserType] = useState('individual');
    const [recommendedPlan, setRecommendedPlan] = useState<IPricingPlan | null>(null);

    const [allPlans, setAllPlans] = useState<IPricingPlan[]>([]);

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => setAllPlans(data))
            .catch(err => console.error("Błąd pobierania pakietów do kalkulatora", err));
    }, []);

    const handleCalculate = (data: { type: string; age: number }) => {
        setLoading(true);

        setTimeout(() => {
            let basePrice = 59;
            if (data.age > 30) basePrice += (data.age - 30) * 2;
            if (data.type === 'family') basePrice *= 2.5;
            if (data.type === 'company') basePrice *= 0.8;

            let recommended = allPlans.find(p => p.name.includes("Podstawowy"));

            if (allPlans.length > 0) {
                if (data.age > 40) {
                    recommended = allPlans.find(p => p.name.includes("Premium")) || allPlans[0];
                } else {
                    recommended = allPlans.find(p => p.name.includes("Podstawowy")) || allPlans[0];
                }
            }

            setResultPrice(Math.round(basePrice));
            setUserAge(data.age);
            setUserType(data.type);
            setRecommendedPlan(recommended || null);

            setIsCalculated(true);
            setLoading(false);

            setTimeout(() => {
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

        }, 1000);
    };

    return (
        <div className="min-h-screen bg-white">
            <HeroSectionCalculator
                onCalculate={handleCalculate}
                isCalculating={loading}
            />

            {isCalculated && (
                <CalculationResults
                    estimatedPrice={resultPrice}
                    packageType={userType}
                    age={userAge}
                    recommendedPlan={recommendedPlan}
                />
            )}

            <div className="border-t border-gray-100">
                <PackageCatalog />
            </div>

            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto text-center max-w-4xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Co wpływa na wysokość Twojej składki?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-4xl mb-4">🎂</div>
                            <h3 className="font-bold text-lg mb-2">Wiek</h3>
                            <p className="text-sm text-gray-600">Starszy wiek to wyższe ryzyko zdrowotne.</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                            <h3 className="font-bold text-lg mb-2">Liczba osób</h3>
                            <p className="text-sm text-gray-600">Pakiety rodzinne są bardziej opłacalne.</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-4xl mb-4">🏥</div>
                            <h3 className="font-bold text-lg mb-2">Zakres</h3>
                            <p className="text-sm text-gray-600">Specjaliści i badania podnoszą cenę.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}