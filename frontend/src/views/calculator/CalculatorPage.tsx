import { useState, useEffect } from 'react';
import HeroSectionCalculator from "./HeroSectionCalculator.tsx";
import CalculationResults from "./CalculationResults.tsx";
import PackageCatalog from "./PackageCalculator.tsx";
import type {IPricingPlan} from "../../types/pricing.types.ts";
import {useAuth} from "../../hooks/useAuth.ts";
import {usePackagePurchase} from "../../hooks/usePackagePurchase.ts";
import Modal from "../../components/ui/Modal.tsx";
import CheckIcon from "../../components/icons/CheckIcon.tsx";
import {DURATION_OPTIONS} from "../../constants/options.ts";
import Button from "../../components/ui/Button.tsx";
import ReviewsList from "../../components/ui/ReviewList.tsx";
import FavoriteButton from "../../components/ui/FavouriteButton.tsx";
import CalendarIcon from "../../components/icons/CalendarIcon.tsx";
const GroupIcon = () => <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.502.152a3 3 0 01-4.682-2.72M10.5 18.72a9.094 9.094 0 013.741-.479M6.75 12.75a3 3 0 11-6 0 3 3 0 016 0zM17.25 12.75a3 3 0 11-6 0 3 3 0 016 0zM10.5 6a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ListIcon = () => <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const API_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/packages`

export default function CalculatorPage() {
    const {
        selectedPlan, selectedDuration, setSelectedDuration, isBuying,
        openModal, closeModal, handleBuyPackage
    } = usePackagePurchase()

    const [isCalculated, setIsCalculated] = useState(false)
    const [loading, setLoading] = useState(false)

    const [resultPrice, setResultPrice] = useState(0)
    const [userAge, setUserAge] = useState(0)
    const [userType, setUserType] = useState('individual')
    const [recommendedPlan, setRecommendedPlan] = useState<IPricingPlan | null>(null)
    const [allPlans, setAllPlans] = useState<IPricingPlan[]>([])

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

    const handleCalculate = (data: { type: string; age: number; familySize?: string; companySize?: number }) => {
        setLoading(true)

        setTimeout(() => {
            let recommended: IPricingPlan | undefined
            let basePrice = 0

            if (data.type === 'company' && data.companySize) {
                recommended = allPlans.find(p => p.category === 'Business' || p.name.includes("Biznes"))
                basePrice = (recommended?.priceValue || 299) * 0.7
            }

            else if (data.type === 'family_custom') {
                recommended = allPlans.find(p => p.name.includes("2+3") || p.name.includes("Premium") && p.category === 'Family')
                if (!recommended) recommended = allPlans.find(p => p.category === 'Family')
                basePrice = (recommended?.priceValue || 400) * 1.2
            }

            else if (data.type === 'family') {
                if (data.familySize === '2+3')
                    recommended = allPlans.find(p => p.name.includes("2+3"))

                 else if (data.familySize === '2+2')
                    recommended = allPlans.find(p => p.name.includes("2+2"))

                 else
                    recommended = allPlans.find(p => p.name.includes("2+1"))

                if (!recommended) recommended = allPlans.find(p => p.category === 'Family')

                basePrice = (recommended?.priceValue || 250) * 0.9
            }

            else {
                if (data.age > 60)
                    recommended = allPlans.find(p => p.category === 'Senior' || p.name.includes("Senior"))

                 else if (data.age > 40)
                    recommended = allPlans.find(p => p.name.includes("Komfort") || p.name.includes("Prestige"))

                else
                    recommended = allPlans.find(p => p.name.includes("Podstawowy"))

                if (!recommended) recommended = allPlans.find(p => p.category === 'Individual')

                basePrice = recommended?.priceValue || 59

                if (data.age > 30 && data.type === 'individual')
                    basePrice += (data.age - 30)

            }
            if (!recommended && allPlans.length > 0) {
                if (data.type.includes('family'))
                    recommended = allPlans.find(p => p.category === 'Family')
                 else if (data.type === 'company')
                    recommended = allPlans.find(p => p.category === 'Business')

                if (!recommended) recommended = allPlans[0]
            }

            setResultPrice(Math.round(basePrice))
            setUserAge(data.age)
            setUserType(data.type)
            setRecommendedPlan(recommended || null)

            setIsCalculated(true)
            setLoading(false)

            setTimeout(() => {
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
            }, 100)

        }, 800)
    };

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
                    onShowDetails={(pkg) => openModal(pkg)}
                />
            )}

            <div className="border-t border-gray-100">
                <PackageCatalog/>
            </div>

            <Modal isOpen={selectedPlan !== null} onClose={closeModal} className="max-w-3xl">
                {selectedPlan && (
                    <div className="text-gray-800 relative">

                        <div
                            className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b border-gray-100 pb-6 pt-6">
                            <div className="flex-grow">
                                <span
                                    className="inline-block bg-blue-50 text-[#4E61F6] text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wide">
                                    {selectedPlan.category}
                                </span>
                                <h2 className="text-3xl font-bold text-gray-900 leading-tight">{selectedPlan.name}</h2>
                            </div>
                            <div className="flex items-center gap-5 flex-shrink-0">
                                <div className="text-right">
                                    <p className="text-4xl font-bold text-[#4E61F6]">{selectedPlan.price}</p>
                                    <p className="text-xs text-gray-400 font-medium">miesięcznie</p>
                                </div>
                                <FavoriteButton packageId={selectedPlan.id}
                                                className="bg-white border border-gray-200 shadow-sm p-3 hover:bg-red-50 text-gray-400 hover:text-red-50 transition-colors"/>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 rounded-xl p-6 mb-8 border border-blue-100">
                            <h4 className="text-blue-800 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Co zawiera pakiet?
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                {selectedPlan.features.map((f, i) => (
                                    <li key={i} className="flex items-start text-gray-700 text-sm">
                                        <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"/>
                                        <span className="flex-1 leading-relaxed">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-8">
                            <h4 className="font-bold text-gray-800 text-sm mb-3">Wybierz okres subskrypcji</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                                {DURATION_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedDuration(option.value)}
                                        className={`
                                            py-3 px-2 rounded-xl border text-sm font-medium transition-all
                                            ${selectedDuration === option.value
                                            ? 'border-[#4E61F6] bg-blue-50 text-[#4E61F6] shadow-sm ring-1 ring-[#4E61F6]'
                                            : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50'
                                        }
                                            ${option.test ? 'border-dashed border-yellow-400 bg-yellow-50 text-yellow-700' : ''}
                                        `}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="md:col-span-2">
                                <h4 className="font-bold text-gray-800 text-sm mb-2">O pakiecie</h4>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {selectedPlan.description}
                                </p>
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <h4 className="font-bold text-gray-800 text-sm mb-2">Dodatki</h4>
                                {selectedPlan.hasDentalCare && <div
                                    className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-600 font-medium border border-gray-200">🦷
                                    Stomatologia</div>}
                                {selectedPlan.hasHospitalization && <div
                                    className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-600 font-medium border border-gray-200">🏥
                                    Szpital</div>}
                                {selectedPlan.hasRehabilitation && <div
                                    className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-600 font-medium border border-gray-200">🤸
                                    Rehabilitacja</div>}
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            className="w-full py-4 text-lg shadow-xl shadow-blue-200/50 hover:shadow-blue-300 hover:-translate-y-1 transition-all"
                            onClick={handleBuyPackage}
                            disabled={isBuying}
                        >
                            {isBuying ? "Przetwarzanie..." : "Wybieram i płacę"}
                        </Button>

                        <p className="text-center text-xs text-gray-400 mt-3 mb-8">
                            Możesz zrezygnować w dowolnym momencie. Brak ukrytych opłat.
                        </p>

                        <div className="pt-6 border-t border-gray-100">
                            <ReviewsList packageId={selectedPlan.id}/>
                        </div>
                    </div>
                )}
            </Modal>

            <section className="py-20 px-4 bg-slate-50 border-t border-gray-200">
                <div className="container mx-auto text-center max-w-5xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12">
                        Co ma wpływ na cenę pakietu medycznego?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <div
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center">
                            <div
                                className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                <CalendarIcon className="w-8 h-8"/>
                            </div>
                            <h3 className="font-bold text-lg text-gray-800 mb-2">Czas umowy</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Dłuższe zobowiązanie (24 miesiące) pozwala nam zaoferować atrakcyjniejsze rabaty (nawet
                                do -15%).
                            </p>
                        </div>

                        <div
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center">
                            <div
                                className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <GroupIcon/>
                            </div>
                            <h3 className="font-bold text-lg text-gray-800 mb-2">Liczba osób</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Pakiety rodzinne i firmowe są znacznie bardziej opłacalne w przeliczeniu na jedną osobę.
                            </p>
                        </div>

                        <div
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center">
                            <div
                                className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-4 text-purple-600">
                                <ListIcon/>
                            </div>
                            <h3 className="font-bold text-lg text-gray-800 mb-2">Zakres pakietów</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Dostęp do zaawansowanej diagnostyki, stomatologii czy rehabilitacji wpływa na ostateczną
                                składkę.
                            </p>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    )
}