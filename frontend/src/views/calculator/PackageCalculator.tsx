import{ useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PackageFilters from '../../components/ui/PackageFilters.tsx';
import Button from '../../components/ui/Button.tsx';
import Rating from '../../components/ui/Rating.tsx';
import Modal from '../../components/ui/Modal.tsx';
import type {IFilterState, IPricingPlan} from "../../types/pricing.types.ts";

import {useConfirm} from "../../hooks/UseConfrim.ts";
import {useNotification} from "../../hooks/UseNotification.ts";
import {useAuth} from "../../hooks/useAuth.ts";
import FavoriteButton from "../../components/ui/FavouriteButton.tsx";

const CheckIcon = () => <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

const API_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/packages`
const SUBSCRIBE_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/subscriptions`

export default function PackageCatalog() {
    const [allPackages, setAllPackages] = useState<IPricingPlan[]>([])
    const [filteredPackages, setFilteredPackages] = useState<IPricingPlan[]>([])
    const [loading, setLoading] = useState(true)
    const {notify} = useNotification()
    const confirm = useConfirm()

    const [filters, setFilters] = useState<IFilterState>({
        category: 'all',
        maxPrice: 1000,
        minSpecialists: 0,
        hasDental: false,
        hasHospital: false
    })

    const [selectedPlan, setSelectedPlan] = useState<IPricingPlan | null>(null)
    const [isBuying, setIsBuying] = useState(false)
    const { token, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                setAllPackages(data)
                setFilteredPackages(data)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        let result = allPackages
        if (filters.category !== 'all') result = result.filter(p => p.category === filters.category)
        result = result.filter(p => p.priceValue <= filters.maxPrice)
        if (filters.hasDental) result = result.filter(p => p.hasDentalCare)
        if (filters.hasHospital) result = result.filter(p => p.hasHospitalization)
        setFilteredPackages(result)
    }, [filters, allPackages])

    const handleBuyPackage = async () => {
        if (!selectedPlan) return;
        if (!token || !user) {
            const shouldLogin = await confirm({
                title: "Wymagane logowanie",
                description: "Musisz być zalogowany, aby kupić pakiet. Czy chcesz się zalogować teraz?",
                confirmText: "Zaloguj się",
                cancelText: "Anuluj",
                variant: 'info'
            })
            if(shouldLogin) navigate('/login')

            return;
        }
        const isConfirmed = await confirm({
            title: "Potwierdzenie zakupu",
            description: `Czy na pewno chcesz wykupić pakiet "${selectedPlan.name}" za ${selectedPlan.price}?`,
            confirmText: "Kupuję",
            cancelText: "Anuluj",
            variant: 'info'
        })
        if (!isConfirmed) return

        setIsBuying(true)
        try {
            const response = await fetch(`${SUBSCRIBE_URL}/${selectedPlan.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Błąd zakupu");
            notify.success(`Pomyślnie wykupiłeś pakiet: ${selectedPlan.name}`);
            setSelectedPlan(null);
            navigate('/profile');
        } catch (err) {
            notify.error(err instanceof Error ? err.message : String(err));
        } finally {
            setIsBuying(false);
        }
    }

    return (
        <section className="py-16 px-4 bg-slate-50 border-t border-gray-200" id="full-catalog">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Pełna oferta ubezpieczeń</h2>
                    <p className="text-gray-600">Przeglądaj wszystkie dostępne pakiety i użyj filtrów, aby znaleźć idealny dla siebie.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-1/4 flex-shrink-0">
                        <div className="sticky top-24">
                            <PackageFilters filters={filters} setFilters={setFilters} />
                        </div>
                    </div>
                    <div className="w-full lg:w-3/4">
                        {loading ? (
                            <div className="text-center py-20 text-gray-500">Ładowanie ofert...</div>
                        ) : filteredPackages.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                                <p className="text-xl text-gray-500">Brak pakietów spełniających kryteria.</p>
                                <Button variant="secondary" className="mt-4" onClick={() => setFilters({ ...filters, category: 'all', maxPrice: 1000, hasDental: false, hasHospital: false })}>Resetuj filtry</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredPackages.map((pkg) => (
                                    <div key={pkg.id}
                                         className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col md:flex-row gap-6">
                                        <div className="absolute top-4 right-4">
                                            <FavoriteButton packageId={pkg.id}/>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-800">{pkg.name}</h3>
                                                    <p className="text-sm text-gray-500">{pkg.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-bold text-[#4E61F6]">{pkg.price}</div>
                                                    <div className="text-sm text-gray-400">miesięcznie</div>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 my-4">{pkg.description}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {pkg.hasDentalCare && <span
                                                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">🦷 Stomatolog</span>}
                                                {pkg.hasHospitalization && <span
                                                    className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">🏥 Szpital</span>}
                                                <span
                                                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">👨‍⚕️ {pkg.specialistsCount} Specjalistów</span>
                                            </div>
                                            <Rating rating={pkg.averageRating} reviews={pkg.reviews}/>
                                        </div>
                                        <div
                                            className="flex-shrink-0 flex flex-col justify-center gap-3 md:w-48 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                            <Button variant="primary" className="w-full text-sm"
                                                    onClick={() => setSelectedPlan(pkg)}>Szczegóły</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={selectedPlan !== null} onClose={() => setSelectedPlan(null)}>
                {selectedPlan && (
                    <div className="text-gray-800">
                        <h2 className="text-3xl font-bold mb-4">{selectedPlan.name}</h2>
                        <p className="text-4xl font-bold text-blue-600 mb-6">{selectedPlan.price}</p>
                        <ul className="space-y-2 mb-6">
                            {selectedPlan.features.map((f, i) => <li key={i} className="flex items-center text-gray-600"><CheckIcon /> {f}</li>)}
                        </ul>
                        <Button variant="primary" className="w-full py-3" onClick={handleBuyPackage} disabled={isBuying}>
                            {isBuying ? "Przetwarzanie..." : "Wybieram ten pakiet"}
                        </Button>
                    </div>
                )}
            </Modal>
        </section>
    );
}