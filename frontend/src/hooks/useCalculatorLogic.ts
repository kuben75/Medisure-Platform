import { useState, useEffect } from 'react';
import type {ICalculationData, IPricingPlan} from "../types/pricing.types.ts";
import { useAuth } from "./useAuth.ts";
import { calculatePersonalizedPrice } from "../utils/pricingHelpers.ts";

const API_URL = `${import.meta.env.VITE_API_URL}/packages`

export const useCalculatorLogic = () => {
    const { user } = useAuth();

    const [allPlans, setAllPlans] = useState<IPricingPlan[]>([])
    const [calculatedAge, setCalculatedAge] = useState<number | undefined>(undefined)

    const [isCalculated, setIsCalculated] = useState(false)
    const [loading, setLoading] = useState(false)
    const [resultPrice, setResultPrice] = useState(0)
    const [userAge, setUserAge] = useState(0)
    const [userType, setUserType] = useState('Indywidualny')
    const [recommendedPlan, setRecommendedPlan] = useState<IPricingPlan | null>(null)
    const [budgetExceeded, setBudgetExceeded] = useState(false)

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => setAllPlans(data))
            .catch(err => console.error(err))
    }, [])

    useEffect(() => {
        if (user?.birthDate) {
            const birth = new Date(user.birthDate)
            const today = new Date()
            let age = today.getFullYear() - birth.getFullYear()
            const m = today.getMonth() - birth.getMonth()
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            setCalculatedAge(age)
        }
    }, [user])

    const calculateSubscription = (data: ICalculationData) => {
        setLoading(true);

        setTimeout(() => {
            let recommended: IPricingPlan | undefined
            let basePrice = 0
            let targetCategory = ''
            let isOverBudget = false

            if (data.type === 'Biznesowy') targetCategory = 'Biznesowy'
            else if (data.type.includes('Rodzinny')) targetCategory = 'Rodzinny'
            else if (data.type === 'family_custom') targetCategory = 'family_custom'
            else {
                if (data.age >= 60) targetCategory = 'Senior'
                else targetCategory = 'Indywidualny'
            }

            const categoryPlans = allPlans
                .filter(p => p.category === targetCategory)
                .sort((a, b) => a.priceValue - b.priceValue)

            if (targetCategory === 'Biznesowy') {
                recommended = categoryPlans.find(p => p.name.includes("Biznes"))
            }
            else if (targetCategory === 'Rodzinny' && data.type === 'family_custom') {
                recommended = undefined;
                basePrice = 0;
            }
            else {
                const plansWithRealPrices = categoryPlans.map(p => {
                    const calculated = calculatePersonalizedPrice(p.priceValue, p.category, data.age);
                    return { ...p, calculatedPrice: calculated };
                }).sort((a, b) => a.calculatedPrice - b.calculatedPrice);

                const budgetLimit = data.maxPrice || 100000
                const affordablePlans = plansWithRealPrices.filter(p => p.calculatedPrice <= budgetLimit)

                if (affordablePlans.length > 0) {
                    recommended = affordablePlans[affordablePlans.length - 1]
                } else {
                    recommended = plansWithRealPrices[0]
                    isOverBudget = true
                }

                if (recommended) basePrice = (recommended as any).calculatedPrice || recommended.priceValue
                else basePrice = 59
            }

            setResultPrice(Math.round(basePrice));
            setUserAge(data.age);
            setUserType(targetCategory);
            setRecommendedPlan(recommended || null);
            setBudgetExceeded(isOverBudget);

            setIsCalculated(true)
            setLoading(false)

            setTimeout(() => {
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
            }, 100)

        }, 800)
    }

    return {
        isCalculated,
        loading,
        resultPrice,
        userAge,
        userType,
        recommendedPlan,
        budgetExceeded,
        calculatedAge,
        calculateSubscription
    }
}