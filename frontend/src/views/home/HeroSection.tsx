// import {pricingPlans} from "../../tests/MockData.ts"
import Button from "../../components/ui/Button.tsx"
import {useEffect, useState} from "react";
import Modal from "../../components/ui/Modal.tsx";
import Rating from "../../components/ui/Rating.tsx";
import { useNavigate } from 'react-router-dom';
import type {IPricingPlan} from "../../types/pricing.types.ts";
import ReviewsList from "../../components/ui/ReviewList.tsx";
import {useConfirm} from "../../hooks/UseConfrim.ts";
import {useNotification} from "../../hooks/UseNotification.ts";
import {useAuth} from "../../hooks/useAuth.ts";
import FavoriteButton from "../../components/ui/FavouriteButton.tsx";

export default function HeroSection() {
    const [selectedPlan, setSelectedPlan] = useState<IPricingPlan | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [pricingPlans, setPricingPlans] = useState<IPricingPlan[]>([])
    const { token, user } = useAuth()
    const [isBuying, setIsBuying] = useState(false)
    const navigate = useNavigate()
    const {notify} = useNotification()
    const API_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/packages`
    const SUBSCRIBE_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/subscriptions`
    const confirm = useConfirm()

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true)
                const response = await fetch(API_URL)
                if (!response.ok) throw new Error("Błąd sieci")

                const data: IPricingPlan[] = await response.json()
                const featuredPlans = data.filter(p => p.isFeatured).slice(0, 3)
                if(featuredPlans.length === 0)
                    setPricingPlans(data.slice(0, 3))
                else
                    setPricingPlans(featuredPlans)

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                notify.error("Nie udało się pobrać ofert.")
            } finally {
                setLoading(false)
            }
        }
        fetchPackages()
    }, [API_URL, notify])

    const handleBuyPackage = async () => {
        if (!selectedPlan) return;

        if (!token || !user) {
            notify.info("Musisz się zalogować, aby wykupić pakiet!")
            return
        }
        const isConfirmed = await confirm({
            title: "Potwierdzenie zakupu",
            description: `Czy na pewno chcesz wykupić pakiet "${selectedPlan.name}" za ${selectedPlan.price}?`,
            confirmText: "Tak, kupuję",
            variant: 'info'
        })
        if (!isConfirmed) return

        setIsBuying(true)
        try {
            const response = await fetch(`${SUBSCRIBE_URL}/${selectedPlan.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.Message || "Wystąpił błąd podczas zakupu.")
            }

            notify.success("Gratulacje! Pakiet został pomyślnie wykupiony. Sprawdź swój profil.")
            setSelectedPlan(null)

        } catch (err) {
            notify.error(`Błąd: ${err instanceof Error ? err.message : String(err)}`)
        } finally {
            setIsBuying(false)
        }
    }

    return (
        <section className="relative w-full text-center text-white py-20 md:pb-32 px-4 bg-gradient-to-br from-blue-600 to-indigo-800">
            <div className="max-w-6xl mx-auto pt-10">
                <h1 className="text-4xl text-white md:text-5xl font-bold mb-4">Porównywarka Pakietów Medycznych</h1>
                <p className="text-lg md:text-xl text-blue-100 max-2-3x1 mx-auto mb-12">Zestaw oferty czołowych usługodawców w Polsce i wybierz pakiet
                    medyczny dopasowany do swoich potrzeb – szybko i wygodnie.</p>
                {loading &&  (
                    <div className="text-2xl font-semibold p-10">Ładowanie pakietów...</div>
                )}
            </div>
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {pricingPlans.map((plan) => (
                        <div key={plan.id}
                             className="bg-white backdrop-blur-lg rounded-xl p-6 text-center shadow-lg border border-white/20 flex flex-col">
                            <div className="absolute top-4 left-4 z-20">
                                <FavoriteButton packageId={plan.id} className="bg-slate-100 text-red-400 hover:text-red-700"/>
                            </div>

                            <h3 className="text-xl text-gray-800 font-semibold mb-2">{plan.name}</h3>
                            <p className="text-3xl text-gray-800 font-bold mb-1">{plan.price}
                                <span className="text-base font-normal"> / miesiąc</span>
                            </p>
                            <ul className="space-y-2 my-6 text-gray-800 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center justify-center">
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Rating rating={plan.averageRating} reviews={plan.reviews}/>
                            <p className="text-sm text-gray-600 mb-6 flex-grow">{plan.description}</p>
                            <Button variant="primary" className="w-full" onClick={() => setSelectedPlan(plan)}>
                                Zobacz szczegóły
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-12">
                <Button variant="secondary" onClick={() => navigate('/kalkulator')}>
                Kliknij, aby zobaczyć więcej pakietów
                </Button>
            </div>
            <Modal isOpen={selectedPlan !== null} onClose={() => setSelectedPlan(null)}>
                {selectedPlan && (
                    <div className="text-gray-800">

                        <h2 className="text-3xl font-bold mb-4">{selectedPlan.name}</h2>
                        <p className="text-4xl font-bold text-blue-600 mb-6">{selectedPlan.price}
                            <span className="text-lg font-normal text-gray-600"> / miesiąc</span>
                        </p>
                        <h4 className="text-gray-700 font-semibold text-lg mb-3">Co obejmuje pakiet?</h4>
                        <ul className="space-y-2 mb-6 text-left">
                            {selectedPlan.features.map((f, i) => (
                                <li key={i} className="flex items-center"><span className="text-green-500 mr-3">✔</span><span>{f}</span></li>
                            ))}
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span><span>Dostęp do 500+ placówek</span></li>
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span><span>Pełna diagnostyka (RTG, USG)</span></li>
                        </ul>
                        <p className="text-gray-600 mb-8">{selectedPlan.description}</p>

                        <Button
                            variant="primary"
                            className="w-full text-lg py-3 disabled:opacity-70"
                            onClick={handleBuyPackage}
                            disabled={isBuying}
                        >
                            {isBuying ? "Przetwarzanie..." : "Kup pakiet"}
                        </Button>
                        <ReviewsList packageId={selectedPlan.id} />
                    </div>
                )}
            </Modal>
        </section>
    )
}