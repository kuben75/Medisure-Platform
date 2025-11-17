// import {pricingPlans} from "../../tests/MockData.ts"
import Button from "../../components/ui/Button.tsx"
import type {IPricingPlan} from "../../types/types.ts";
import {useEffect, useState} from "react";
import Modal from "../../components/ui/Modal.tsx";
import Rating from "../../components/ui/Rating.tsx";

export default function HeroSection() {
    const [selectedPlan, setSelectedPlan] = useState<IPricingPlan | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [pricingPlans, setPricingPlans] = useState<IPricingPlan[]>([])

    const API_URL: string = "https://localhost:44333/api/packages"

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await fetch(API_URL)
                if (!response.ok) throw new Error(`Błąd podczas pobierania danych: ${response.status}`)

                const data: IPricingPlan[] = await response.json()
                setPricingPlans(data)
            }
            catch (e) {
                console.error(`Błąd pobierania danych: ${e}`)
                setError("Wystąpił błąd podczas ładowania pakietów medycznych.")
            }
            finally {
                setLoading(false)
            }
        }
        fetchPackages()
    }, [])

    return (
        <section className="relative w-full text-center text-white py-20 md:pb-32 px-4 bg-gradient-to-br from-blue-600 to-indigo-800">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl text-white md:text-5xl font-bold mb-4">Porównywarka Pakietów Medycznych</h1>
                <p className="text-lg md:text-xl text-blue-100 max-2-3x1 mx-auto mb-12">Zestaw oferty czołowych usługodawców w Polsce i wybierz pakiet
                    medyczny dopasowany do swoich potrzeb – szybko i wygodnie.</p>
                {loading &&  (
                    <div className="text-2xl font-semibold p-10">Ładowanie pakietów...</div>
                )}
                {error && (
                    <div className="error-text max-w-lg mx-auto" role="alert">
                        <strong className="font-bold">Błąd!</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}
            </div>
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {pricingPlans.map((plan) => (
                        <div key={plan.id} className="bg-white backdrop-blur-lg rounded-xl p-6 text-center shadow-lg border border-white/20 flex flex-col">
                            <h3 className="text-xl text-gray-800 font-semibold mb-2">{plan.name}</h3>
                            <p className="text-3xl text-gray-800 font-bold mb-1">{plan.price}
                                <span className="text-base font-normal"> / miesiąc</span>
                            </p>
                            <ul className="space-y-2 my-6 text-gray-800 flex-grow">
                                {plan.features.map((feature, i )=> (
                                    <li key={i} className="flex items-center justify-center">
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Rating rating={plan.averageRating} reviews={plan.reviews} />
                            <p className="text-sm text-gray-600 mb-6 flex-grow">{plan.description}</p>
                            <Button variant="primary" className="w-full" onClick={() => setSelectedPlan(plan)}>
                                Zobacz szczegóły
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-12">
                <Button variant="secondary">
                    Kliknij, aby zobaczyć więcej pakietów
                </Button>
            </div>
            <Modal isOpen={selectedPlan !== null} onClose={() => setSelectedPlan(null)}>
                {selectedPlan && (
                    <div className="text-gray-800">
                        <h2 className="h2-primary">{selectedPlan.name}</h2>
                        <p className="text-4l font-bold text-blue-600 mb-6">{selectedPlan.price}
                            <span className="text-lg font-normal text-gray-600"> / miesiąc</span>
                        </p>
                        <h4 className="text-gray-700 font-semibold text-lg mb-3">Co obejmuje pakiet?</h4>
                        <ul className="space-y-2 mb-6 text-left">
                            {selectedPlan.features.map((f, i) => (
                                <li key={i} className="flex items-center">
                                    <span className="text-green-500 mr-3">✔</span>
                                    <span>{f}</span>
                                </li>
                            ))}
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span><span>Dostęp do 500+ placówek</span>
                            </li>
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span><span>Pełna diagnostyka (RTG, USG)</span>
                            </li>
                        </ul>
                        <p className="text-gray-600 mb-8">{selectedPlan.description}</p>
                        <Button variant="primary" className="w-full text-lg py-3">Wybieram ten pakiet</Button>
                    </div>
                )}
            </Modal>
        </section>
    )
}