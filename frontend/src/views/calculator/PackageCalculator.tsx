import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import PackageFilters from '../../components/ui/PackageFilters.tsx';
import Button from '../../components/ui/Button.tsx';
import Rating from '../../components/ui/Rating.tsx';
import Modal from '../../components/ui/Modal.tsx';
import {useComparison} from "../../hooks/useComparison.ts";
import ComparisonBar from "../../components/ui/ComparisonBar.tsx";
import type {IFilterState, IPricingPlan} from "../../types/pricing.types.ts";
import {useConfirm} from "../../hooks/UseConfrim.ts";
import {useNotification} from "../../hooks/UseNotification.ts";
import {useAuth} from "../../hooks/useAuth.ts";
import FavoriteButton from "../../components/ui/FavouriteButton.tsx";
import CheckIcon from "../../components/icons/CheckIcon.tsx";
import ReviewsList from "../../components/ui/ReviewList.tsx";


const API_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/packages`
const SUBSCRIBE_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/subscriptions`
const ITEMS_PER_PAGE = 5

const durationOptions = [
    {value: '3m', label: '3 miesiące', test: false},
    {value: '6m', label: '6 miesięcy', test: false},
    {value: '1y', label: '1 Rok', test: false},
    {value: '7d', label: '7 dni (test)', test: true}
]

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

    const [selectedDuration, setSelectedDuration] = useState('1y')

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
    }, []);

    useEffect(() => {
        let result = allPackages;
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
                description: "Musisz być zalogowany, aby kupić pakiet.",
                confirmText: "Zaloguj się",
                cancelText: "Anuluj",
                variant: 'info'
            })
            if (shouldLogin) navigate('/login')
            return
        }
        const durationLabel = durationOptions.find(d => d.value === selectedDuration)?.label

        const isConfirmed = await confirm({
            title: "Potwierdzenie zakupu",
            description: `Kupujesz pakiet "${selectedPlan.name}" na okres: ${durationLabel}. Kontynuować?`,
            confirmText: "Kupuję i płacę",
            cancelText: "Anuluj",
            variant: 'info'
        })
        if (!isConfirmed) return

        setIsBuying(true)
        try {
            const response = await fetch(`${SUBSCRIBE_URL}/${selectedPlan.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ duration: selectedDuration })
            })

            if (!response.ok) throw new Error("Błąd zakupu")

            notify.success(`Sukces! Wykupiłeś pakiet na ${durationLabel}.`)
            setSelectedPlan(null)
            navigate('/profile')
        } catch (err) {
            notify.error(err instanceof Error ? err.message : "Wystąpił błąd.");
        } finally {
            setIsBuying(false)
        }
    }

    const openModal = (pkg: IPricingPlan) => {
        setSelectedPlan(pkg);
        setSelectedDuration('1y')
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
                                        className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col md:flex-row overflow-hidden ${pkg.isFeatured ? 'border-blue-200 ring-1 ring-blue-50' : 'border-gray-100'}`}
                                    >
                                        {pkg.isFeatured && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#4E61F6]"></div>}

                                        <div className="flex-grow p-6 md:p-8 pl-8 relative">
                                            <div className="flex flex-col items-start mb-4 pr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {pkg.isFeatured && (
                                                        <span className="inline-block bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                                            Polecany
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{pkg.category}</span>
                                                </div>

                                                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-[#4E61F6] transition-colors mt-1 leading-tight">
                                                    {pkg.name}
                                                </h3>

                                                <div className="mt-2">
                                                    <Rating rating={pkg.averageRating} reviews={pkg.reviews} className="flex items-center gap-1 !mt-0 !mb-0" />
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mb-5 leading-relaxed border-b border-gray-50 pb-4 text-sm line-clamp-2">
                                                {pkg.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {pkg.hasDentalCare && <span className="inline-flex items-center bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-teal-100">🦷 Stomatolog</span>}
                                                {pkg.hasHospitalization && <span className="inline-flex items-center bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-100">🏥 Szpital</span>}
                                                <span className="inline-flex items-center bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200">👨‍⚕️ {pkg.specialistsCount} Specjalistów</span>
                                            </div>
                                        </div>

                                        <div className="md:w-72 bg-gray-50/30 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col justify-between gap-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="text-left md:text-right flex-grow">
                                                    <div className="flex items-baseline justify-start md:justify-end gap-1 whitespace-nowrap">
                                                        <span className="text-3xl font-extrabold text-[#4E61F6] leading-none">{pkg.price}</span>
                                                        <span className="text-xs text-gray-400 font-medium">/ mies</span>
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-500 text-left md:text-right">
                                                        {pkg.facilitiesCount} placówek
                                                    </div>
                                                </div>
                                                <div className="hidden md:block ml-3 flex-shrink-0">
                                                    <FavoriteButton packageId={pkg.id} className="bg-white shadow-sm border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4 md:hidden">
                                                <FavoriteButton packageId={pkg.id} className="bg-white/80 backdrop-blur-sm shadow-sm" />
                                            </div>

                                            <div className="space-y-3 mt-auto">
                                                <Button variant="primary" className="w-full !py-2.5 text-sm shadow-md hover:shadow-lg" onClick={() => openModal(pkg)}>
                                                    Szczegóły oferty
                                                </Button>

                                                <label className={`flex items-center justify-center cursor-pointer select-none w-full py-2 rounded-lg border transition-all duration-200 ${isInComparison(pkg.id) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'}`}>
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
                                                        {isInComparison(pkg.id) ? "Wybrano" : "+ Porównaj"}
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
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">&larr; Poprzednia</button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => paginate(i + 1)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${currentPage === i + 1 ? 'bg-[#4E61F6] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{i + 1}</button>
                                ))}
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Następna &rarr;</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={selectedPlan !== null} onClose={() => setSelectedPlan(null)} className="max-w-3xl ">
                {selectedPlan && (
                    <div className="text-gray-800 relative">

                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b border-gray-100 pb-6 pt-6">
                            <div className="flex-grow">
                                <span className="inline-block bg-blue-50 text-[#4E61F6] text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wide">{selectedPlan.category}</span>
                                <h2 className="text-3xl font-bold text-gray-900 leading-tight">{selectedPlan.name}</h2>
                            </div>
                            <div className="flex items-center gap-5 flex-shrink-0">
                                <div className="text-right">
                                    <p className="text-4xl font-bold text-[#4E61F6]">{selectedPlan.price}</p>
                                    <p className="text-xs text-gray-400 font-medium">miesięcznie</p>
                                </div>
                                <FavoriteButton packageId={selectedPlan.id} className="bg-white border border-gray-200 shadow-sm p-3 hover:bg-red-50 text-gray-400 hover:text-red-50 transition-colors" />
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
                                        <CheckIcon className="w-5 h-5 text-green-500"/>
                                        <span className="flex-1 leading-relaxed">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-8">
                            <h4 className="font-bold text-gray-800 text-sm mb-3">Wybierz okres subskrypcji</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {durationOptions.map((option) => (
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
                                        {selectedDuration === option.value && <span className="ml-1"></span>}
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
                                {selectedPlan.hasDentalCare && <div className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-600 font-medium border border-gray-200">🦷 Stomatologia</div>}
                                {selectedPlan.hasHospitalization && <div className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-600 font-medium border border-gray-200">🏥 Szpital</div>}
                                {selectedPlan.hasRehabilitation && <div className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-600 font-medium border border-gray-200">🤸 Rehabilitacja</div>}
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
                        <p className="text-center text-xs text-gray-400 mt-3 mb-4">
                            Możesz zrezygnować w dowolnym momencie.
                        </p>

                        <div className="pt-1 border-t border-gray-100">
                            <ReviewsList packageId={selectedPlan.id} />
                        </div>
                    </div>
                )}
            </Modal>
            <ComparisonBar />
        </section>
    )
}