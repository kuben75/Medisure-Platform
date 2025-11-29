import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import PackageFilters from '../../components/ui/PackageFilters.tsx';
import Button from '../../components/ui/Button.tsx';
import Rating from '../../components/ui/Rating.tsx';
import Modal from '../../components/ui/Modal.tsx';
import {useComparison} from "../../hooks/useComparison.tsx";
import ComparisonBar from "../../components/ui/ComparisonBar.tsx";
import type {IFilterState, IPricingPlan} from "../../types/pricing.types.ts";
import {useConfirm} from "../../hooks/UseConfrim.ts";
import {useNotification} from "../../hooks/UseNotification.ts";
import {useAuth} from "../../hooks/useAuth.ts";
import FavoriteButton from "../../components/ui/FavouriteButton.tsx";
import CheckIcon from "../../components/icons/CheckIcon.tsx";


const API_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/packages`
const SUBSCRIBE_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/subscriptions`
const ITEMS_PER_PAGE = 5

export default function PackageCatalog() {
    const [allPackages, setAllPackages] = useState<IPricingPlan[]>([])
    const [filteredPackages, setFilteredPackages] = useState<IPricingPlan[]>([])
    const [loading, setLoading] = useState(true)

    const [currentPage, setCurrentPage] = useState(1)

    const { notify } = useNotification()
    const confirm = useConfirm()
    const { addToComparison, removeFromComparison, isInComparison } = useComparison()

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
        setCurrentPage(1)
    }, [filters, allPackages])

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
    const currentItems = filteredPackages.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE)

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber)
        document.getElementById('catalog-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const handleBuyPackage = async () => {
        if (!selectedPlan) return
        if (!token || !user) {
            const shouldLogin = await confirm({
                title: "Wymagane logowanie",
                description: "Musisz być zalogowany, aby kupić pakiet. Czy chcesz się zalogować teraz?",
                confirmText: "Zaloguj się",
                cancelText: "Anuluj",
                variant: 'info'
            })
            if (shouldLogin) navigate('/login')
            return
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
                headers: {'Authorization': `Bearer ${token}`}
            })
            if (!response.ok) throw new Error("Błąd zakupu")
            notify.success(`Pomyślnie wykupiłeś pakiet: ${selectedPlan.name}`)
            setSelectedPlan(null)
            navigate('/profile')
        } catch (err) {
            notify.error(err instanceof Error ? err.message : String(err))
        } finally {
            setIsBuying(false)
        }
    }

    return (
        <section className="py-20 px-4 bg-slate-50 border-t border-gray-200" id="full-catalog">
            <div className="container mx-auto max-w-7xl">

                <div className="text-center mb-12">
                    <span className="text-[#4E61F6] font-bold tracking-wider uppercase text-sm">Pełna oferta</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Znajdź idealne ubezpieczenie</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Przeglądaj wszystkie dostępne pakiety ({filteredPackages.length}), korzystaj z filtrów i porównuj oferty.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    <div className="w-full lg:w-1/4 flex-shrink-0 transition-all duration-300">
                        <div className="sticky top-24">
                            <PackageFilters filters={filters} setFilters={setFilters}/>
                        </div>
                    </div>

                    <div className="w-full lg:w-3/4" id="catalog-list">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E61F6] mb-4"></div>
                                <p>Ładowanie ofert...</p>
                            </div>
                        ) : filteredPackages.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Nie znaleziono pakietów</h3>
                                <p className="text-gray-500 mb-6">Zmień kryteria wyszukiwania.</p>
                                <Button variant="secondary" onClick={() => setFilters({
                                    category: 'all',
                                    maxPrice: 1000,
                                    minSpecialists: 0,
                                    hasDental: false,
                                    hasHospital: false
                                })}>Zresetuj filtry</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {currentItems.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        className={`group bg-white rounded-2xl p-0 shadow-sm hover:shadow-xl transition-all duration-300 border relative flex flex-col md:flex-row overflow-hidden ${pkg.isFeatured ? 'border-blue-200 ring-1 ring-blue-50' : 'border-gray-100'}`}>
                                        {pkg.isFeatured && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#4E61F6]"></div>}

                                        <div className="flex-grow p-6 md:p-8 pl-8">
                                            <div className="flex justify-between items-start mb-3 pr-4">
                                                <div>
                                                    {pkg.isFeatured && (
                                                        <span className="inline-block bg-blue-50 text-[#4E61F6] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide mb-2">
                                                            Polecany wybór
                                                        </span>
                                                    )}
                                                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-[#4E61F6] transition-colors">
                                                        {pkg.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wide">{pkg.category}</p>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mb-5 leading-relaxed border-b border-gray-50 pb-4 text-sm">
                                                {pkg.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-5">
                                                {pkg.hasDentalCare && <span className="inline-flex items-center bg-teal-50 text-teal-700 px-2.5 py-1 rounded text-xs font-semibold border border-teal-100">🦷 Stomatolog</span>}
                                                {pkg.hasHospitalization && <span className="inline-flex items-center bg-rose-50 text-rose-700 px-2.5 py-1 rounded text-xs font-semibold border border-rose-100">🏥 Szpital</span>}
                                                <span className="inline-flex items-center bg-gray-50 text-gray-600 px-2.5 py-1 rounded text-xs font-semibold border border-gray-200">👨‍⚕️ {pkg.specialistsCount} Specjalistów</span>
                                                <Rating rating={pkg.averageRating} reviews={pkg.reviews}/>
                                            </div>

                                        </div>

                                        <div className="md:w-72 bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col justify-between">

                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-extrabold text-[#4E61F6]">{pkg.price}</span>
                                                        <span className="text-xs text-gray-400 font-medium">/ mies</span>
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Dostępne w <strong className="text-gray-700">{pkg.facilitiesCount}</strong> placówkach
                                                    </div>
                                                </div>
                                                <FavoriteButton packageId={pkg.id} className="bg-white shadow-sm border border-gray-100 hover:bg-red-50" />
                                            </div>

                                            <div className="space-y-3 mt-auto">
                                                <Button variant="primary" className="w-full !py-2.5 text-sm shadow-md hover:shadow-lg" onClick={() => setSelectedPlan(pkg)}>
                                                    Szczegóły oferty
                                                </Button>

                                                <label className={`flex items-center justify-center cursor-pointer select-none w-full py-2 rounded-lg border transition-all ${isInComparison(pkg.id) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={isInComparison(pkg.id)}
                                                        onChange={() => {
                                                            if (isInComparison(pkg.id)) removeFromComparison(pkg.id);
                                                            else addToComparison(pkg);
                                                        }}
                                                    />
                                                    <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                                        {isInComparison(pkg.id) && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                                                        {isInComparison(pkg.id) ? "Wybrano do porównania" : "+ Porównaj"}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-12 gap-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    &larr; Poprzednia
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => paginate(i + 1)}
                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                                            currentPage === i + 1
                                                ? 'bg-[#4E61F6] text-white shadow-md'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Następna &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={selectedPlan !== null} onClose={() => setSelectedPlan(null)}>
                {selectedPlan && (
                    <div className="text-gray-800 relative">
                        <div className="absolute top-0 right-8">
                            <FavoriteButton packageId={selectedPlan.id} />
                        </div>
                        <div className="flex justify-between items-start mb-6 pr-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">{selectedPlan.name}</h2>
                                <p className="text-gray-500 text-sm mt-1">{selectedPlan.category}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-bold text-[#4E61F6]">{selectedPlan.price}</p>
                                <p className="text-xs text-gray-400">miesięcznie</p>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 rounded-xl p-5 mb-6 border border-blue-100">
                            <h4 className="text-blue-800 font-bold text-sm uppercase tracking-wide mb-3">Co obejmuje pakiet?</h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                                {selectedPlan.features.map((f, i) => (
                                    <li key={i} className="flex items-start text-gray-700 text-sm">
                                        <CheckIcon/>
                                        <span className="flex-1">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4 mb-8">
                            <p className="text-gray-600 leading-relaxed">{selectedPlan.description}</p>
                            <div className="flex flex-wrap gap-3">
                                {selectedPlan.hasDentalCare && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs">✅ Stomatolog</span>}
                                {selectedPlan.hasHospitalization && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs">✅ Szpital</span>}
                                {selectedPlan.hasRehabilitation && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs">✅ Rehabilitacja</span>}
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            className="w-full py-4 text-lg shadow-xl shadow-blue-200"
                            onClick={handleBuyPackage}
                            disabled={isBuying}
                        >
                            {isBuying ? "Przetwarzanie..." : "Wybieram ten pakiet"}
                        </Button>
                    </div>
                )}
            </Modal>
            <ComparisonBar />
        </section>
    )
}