import Button from "../../components/ui/Button.tsx"
import {useEffect, useState} from "react"
import Modal from "../../components/ui/Modal.tsx"
import Rating from "../../components/ui/Rating.tsx"
import { useNavigate } from 'react-router-dom'
import type {IPricingPlan} from "../../types/pricing.types.ts"
import FavoriteButton from "../../components/ui/FavouriteButton.tsx"
import {DURATION_OPTIONS} from "../../constants/options.ts"
import {useNotification} from "../../hooks/UseNotification.ts"
import {usePackagePurchase} from "../../hooks/usePackagePurchase.ts"
import FlashIcon from "../../components/icons/FlashIcon.tsx"
import {useComparison} from "../../hooks/useComparison.ts"
import ChevronRightIcon from "../../components/icons/ChevronRightIcon.tsx"

export default function HeroSection() {
    const {
        selectedPlan,
        selectedDuration,
        setSelectedDuration,
        openModal,
        closeModal,
    } = usePackagePurchase();

    const [plans, setPlans] = useState<IPricingPlan[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const navigate = useNavigate()
    const { notify } = useNotification()
    const { addToComparison } = useComparison()

    const API_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/packages`

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true)
                const response = await fetch(API_URL)
                if (!response.ok) throw new Error("Błąd sieci")

                const data: IPricingPlan[] = await response.json()
                const featuredPlans = data.filter((p) => p.isFeatured).slice(0, 3)

                if(featuredPlans.length === 0)
                    setPlans(data.slice(0, 3))
                else
                    setPlans(featuredPlans)

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                setError("Nie udało się pobrać ofert.");
                notify.error("Nie udało się pobrać ofert.")
            } finally {
                setLoading(false)
            }
        }
        fetchPackages()
    }, [])


    const handleProceedToCalculator = () => {
        if (!selectedPlan) return
        const targetId = selectedPlan.id
        closeModal()
        navigate('/kalkulator', { state: { highlightPackageId: targetId } })
    }

    const handleCompareAndRedirect = () => {
        if (selectedPlan) {
            const targetId = selectedPlan.id
            addToComparison(selectedPlan)
            closeModal()
            navigate('/kalkulator', { state: { highlightPackageId: targetId } })
        }
    }

    return (
        <section className="relative w-full text-center text-white py-24 md:py-28 px-4 bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#4338ca] overflow-hidden">

            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-sm">
                    Twoje Zdrowie, <br className="hidden md:block"/> Nasz Priorytet.
                </h1>
                <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-16 leading-relaxed">
                    Porównaj najlepsze oferty medyczne w Polsce. Wybierz pakiet dopasowany do Twoich potrzeb i ciesz się spokojem.
                </p>

                {loading && (
                    <div className="flex justify-center p-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-15 items-center">
                        {plans.map((plan, index) => (
                            <div
                                key={plan.id}
                                className={`
                                    relative flex flex-col bg-white text-gray-800 rounded-3xl p-6 shadow-2xl transition-all duration-500
                                    transform hover:-translate-y-3 hover:shadow-blue-900/30
                                    ${index === 1 ? 'md:scale-110 z-10 border-4 border-[#4E61F6]/20' : 'border border-transparent opacity-95 hover:opacity-100'}`}>
                                {plan.isFeatured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">Bestseller</div>)}
                                <div className="absolute top-4 right-4 z-20">
                                    <FavoriteButton packageId={plan.id} className="text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"/>
                                </div>

                                <div className="mt-4 mb-2">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{plan.category}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{plan.name}</h3>
                                </div>

                                <div className="my-6 flex justify-center items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-[#4E61F6]">{plan.price}</span>
                                    <span className="text-sm text-gray-400 font-medium">/ mies</span>
                                </div>

                                <ul className="space-y-3 mb-8 text-left flex-grow">
                                    {plan.features.slice(0, 3).map((feature, i) => (
                                        <li key={i} className="flex items-center justify-center text-sm text-gray-600"><FlashIcon /><span className="text-left flex-1">{feature}</span></li>))}
                                </ul>

                                <div className="mb-6 flex justify-center">
                                    <Rating rating={plan.averageRating} reviews={plan.reviews}/>
                                </div>

                                <Button variant={index === 1 ? 'primary' : 'secondary'} className={`w-full py-3.5 text-sm font-bold shadow-lg ${index !== 1 ? 'border-gray-200 hover:border-[#4E61F6] text-gray-600 hover:text-[#4E61F6]' : ''}`} onClick={() => openModal(plan)}>
                                    Sprawdź ofertę
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-20">
                    <p className="text-blue-200 text-sm mb-4 uppercase tracking-wide font-semibold opacity-80">Chcesz zobaczyć więcej opcji?</p>
                    <Button variant="secondary" className="px-10 py-4 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-transform" onClick={() => navigate('/kalkulator')}>
                        Przejdź do pełnego katalogu
                    </Button>
                </div>
            </div>

            <Modal isOpen={selectedPlan !== null} onClose={closeModal} className="max-w-md bg-white overflow-hidden p-0">
                {selectedPlan && (
                    <div className="text-gray-800 relative">
                        <div className="h-36 bg-gradient-to-r from-[#4E61F6] to-[#7C3AED] flex items-center justify-center relative mb-8 rounded-t-2xl -mt-8 -mx-8">
                            <div className="text-white text-center px-4">
                                <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                                    Szczegóły Pakietu
                                </span>
                                <h2 className="text-2xl font-bold leading-tight">{selectedPlan.name}</h2>
                            </div>

                            <div className="absolute top-4 right-4">
                                <FavoriteButton packageId={selectedPlan.id} className="text-white/80 hover:text-white hover:bg-white/20"/>
                            </div>
                        </div>

                        <div className="px-4 pb-6">
                            <div className="text-center mb-6">
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-black text-gray-900">{selectedPlan.price}</span>
                                    <span className="text-gray-500">/ miesiąc</span>
                                </div>
                                <p className="text-xs text-green-600 font-bold mt-2 bg-green-50 inline-block px-2 py-1 rounded">
                                    <span className="mr-1">✓</span> Dostępny od zaraz
                                </p>
                            </div>

                            <p className="text-center text-gray-600 text-sm leading-relaxed mb-8 px-2">
                                {selectedPlan.description}
                            </p>

                            <div className="bg-gray-50 p-4 rounded-xl mb-8 border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">Dostępne warianty czasowe</p>
                                <div className="grid grid-cols-2 gap-7">
                                    {DURATION_OPTIONS.map((option) => (
                                        <button key={option.value} onClick={() => setSelectedDuration(option.value)}
                                            className={`py-2 px-3 rounded-lg text-xs hover:cursor-pointer font-bold transition-all ${selectedDuration === option.value
                                                ? 'bg-[#4E61F6] text-white shadow-md'
                                                : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'}`}>
                                            {option.label}</button>))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button variant="primary" className="w-full py-4 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2" onClick={handleProceedToCalculator}>
                                    Dostosuj i Zamów <ChevronRightIcon className="w-6 h-6"/>
                                </Button>

                                <button onClick={handleCompareAndRedirect} className="w-full text-center text-sm text-gray-500 hover:text-[#4E61F6] transition-colors py-3 border-t border-gray-100 mt-2 font-medium flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Porównaj z innymi ofertami
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </section>
    )
}