import { useState, useEffect } from 'react';
import HeroSectionCalculator from "./HeroSectionCalculator.tsx";
import CalculationResults from "./CalculationResults.tsx";
import type { IPricingPlan } from "../../types/pricing.types.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { usePackagePurchase } from "../../hooks/usePackagePurchase.ts";
import CalendarIcon from "../../components/icons/CalendarIcon.tsx";
import { calculatePersonalizedPrice } from "../../utils/pricingHelpers.ts";
import PackageCatalog from "./PackageCalculator.tsx";
import CheckoutOverlay from "../../components/ui/CheckoutOverlay.tsx";
import PackageDetailsModal from "../../components/ui/PackageDetailsModal.tsx";

const GroupIcon = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.502.152a3 3 0 01-4.682-2.72M10.5 18.72a9.094 9.094 0 013.741-.479M6.75 12.75a3 3 0 11-6 0 3 3 0 016 0zM17.25 12.75a3 3 0 11-6 0 3 3 0 016 0zM10.5 6a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ListIcon = () => <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;

const API_URL = `${import.meta.env.VITE_API_URL}/packages`

export default function CalculatorPage() {
    const {
        selectedPlan,
        selectedDuration,
        setSelectedDuration,
        billingPeriod,
        setBillingPeriod,
        openModal,
        closeModal,
        priceDetails,
        isCheckoutOpen,
        closeCheckout,
        finalizePurchase,
        handleProceedToCheckout,
        options,
        isBuying
    } = usePackagePurchase()

    const [isCalculated, setIsCalculated] = useState(false)
    const [loading, setLoading] = useState(false)

    const [resultPrice, setResultPrice] = useState(0)
    const [userAge, setUserAge] = useState(0)
    const [userType, setUserType] = useState('Indywidualny')
    const [recommendedPlan, setRecommendedPlan] = useState<IPricingPlan | null>(null)
    const [allPlans, setAllPlans] = useState<IPricingPlan[]>([])

    const [budgetExceeded, setBudgetExceeded] = useState(false)

    const { user } = useAuth();
    const [calculatedAge, setCalculatedAge] = useState<number | undefined>(undefined)

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
                age--
            }
            setCalculatedAge(age)
        }
    }, [user])

    const handleCalculate = (data: { type: string; age: number; familySize?: string; companySize?: number; maxPrice?: number }) => {
        setLoading(true)

        setTimeout(() => {
            let recommended: IPricingPlan | undefined;
            let basePrice = 0
            let targetCategory = ''
            let isOverBudget = false;

            if (data.type === 'Biznesowy') targetCategory = 'Biznesowy'
            else if (data.type.includes('Rodzinny')) targetCategory = 'Rodzinny'
            else if (data.type === 'family_custom') targetCategory = 'family_custom';
            else {
                if (data.age >= 60) targetCategory = 'Senior'
                else targetCategory = 'Indywidualny';
            }

            const categoryPlans = allPlans
                .filter(p => p.category === targetCategory)
                .sort((a, b) => a.priceValue - b.priceValue);

            if (targetCategory === 'Biznesowy') {
                recommended = categoryPlans.find(p => p.name.includes("Biznes"));
            }
            else if (targetCategory === 'Rodzinny' && data.type === 'family_custom') {
                recommended = undefined;
                basePrice = 0;
            }
            else {
                const plansWithRealPrices = categoryPlans.map(p => {
                    const calculated = calculatePersonalizedPrice(p.priceValue, p.category, data.age);
                    return { ...p, calculatedPrice: calculated };
                }).sort((a, b) => a.calculatedPrice - b.calculatedPrice); // Sortujemy wg wyliczonej ceny

                const budgetLimit = data.maxPrice || 100000;
                const affordablePlans = plansWithRealPrices.filter(p => p.calculatedPrice <= budgetLimit);

                if (affordablePlans.length > 0) {
                    recommended = affordablePlans[affordablePlans.length - 1];
                } else {
                    recommended = plansWithRealPrices[0]
                    isOverBudget = true
                }

                if (recommended) basePrice = (recommended as any).calculatedPrice || recommended.priceValue
                else basePrice = 59
            }

            setResultPrice(Math.round(basePrice))
            setUserAge(data.age)
            setUserType(targetCategory)
            setRecommendedPlan(recommended || null)
            setBudgetExceeded(isOverBudget)

            setIsCalculated(true)
            setLoading(false)

            setTimeout(() => {
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
            }, 100)

        }, 800)
    }

    const handleOpenRecommended = (pkg: IPricingPlan) => {
        const ageToUse = userAge || calculatedAge || 30
        const personalizedPrice = calculatePersonalizedPrice(pkg.priceValue, pkg.category, ageToUse)
        const packageWithCustomPrice = { ...pkg, priceValue: personalizedPrice }
        openModal(packageWithCustomPrice)
    }

    return (
        <div className="min-h-screen bg-white">
            <HeroSectionCalculator
                onCalculate={handleCalculate}
                isCalculating={loading}
                initialAge={calculatedAge}
            />

            {isCalculated && (
                <CalculationResults
                    estimatedPrice={resultPrice}
                    packageType={userType}
                    age={userAge}
                    recommendedPlan={recommendedPlan}
                    budgetExceeded={budgetExceeded}
                    onShowDetails={(pkg) => handleOpenRecommended(pkg)}
                />
            )}

            <div className="border-t border-gray-100">
                <PackageCatalog/>
            </div>

            <PackageDetailsModal
                isOpen={selectedPlan !== null && !isCheckoutOpen}
                onClose={closeModal}
                plan={selectedPlan}
                userAge={userAge || calculatedAge}
                selectedDuration={selectedDuration}
                onDurationChange={setSelectedDuration}
                billingPeriod={billingPeriod}
                setBillingPeriod={setBillingPeriod}
                onProceedToCheckout={handleProceedToCheckout}
                options={options}
                priceDetails={priceDetails}
                isBuying={isBuying}
            />

            {selectedPlan && (
                <CheckoutOverlay
                    isOpen={isCheckoutOpen}
                    onClose={closeCheckout}
                    plan={selectedPlan}
                    priceDetails={priceDetails}
                    onFinalize={finalizePurchase}
                />
            )}

            <section className="py-20 px-4 bg-slate-50 border-t border-gray-200">
                <div className="container mx-auto text-center max-w-5xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12">
                        Co ma wpływ na cenę pakietu medycznego?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center">
                            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600"><CalendarIcon className="w-8 h-8"/></div>
                            <h3 className="font-bold text-lg text-gray-800 mb-2">Czas umowy</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">Dłuższe zobowiązanie (24 miesiące) pozwala nam zaoferować atrakcyjniejsze rabaty.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center">
                            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-600"><GroupIcon/></div>
                            <h3 className="font-bold text-lg text-gray-800 mb-2">Liczba osób</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">Pakiety rodzinne i firmowe są znacznie bardziej opłacalne w przeliczeniu na jedną osobę.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center">
                            <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-4 text-purple-600"><ListIcon/></div>
                            <h3 className="font-bold text-lg text-gray-800 mb-2">Zakres pakietów</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">Dostęp do zaawansowanej diagnostyki, stomatologii czy rehabilitacji wpływa na ostateczną składkę.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}