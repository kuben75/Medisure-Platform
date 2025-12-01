import {useState, useEffect} from 'react';
import PackageFilters from '../../components/ui/PackageFilters.tsx';
import Button from '../../components/ui/Button.tsx';
import Rating from '../../components/ui/Rating.tsx';
import Modal from '../../components/ui/Modal.tsx';
import {useComparison} from "../../hooks/useComparison.ts";
import ComparisonBar from "../../components/ui/ComparisonBar.tsx";
import type {IFilterState, IPricingPlan} from "../../types/pricing.types.ts";
import FavoriteButton from "../../components/ui/FavouriteButton.tsx";
import CheckIcon from "../../components/icons/CheckIcon.tsx";
import ReviewsList from "../../components/ui/ReviewList.tsx";
import {DURATION_OPTIONS} from "../../constants/options.ts";
import {usePackagePurchase} from "../../hooks/usePackagePurchase.ts";
import {useLocation} from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/packages`
const ITEMS_PER_PAGE = 5


export default function PackageCatalog() {
    const {
        selectedPlan,
        selectedDuration,
        setSelectedDuration,
        isBuying,
        openModal,
        closeModal,
        handleBuyPackage
    } = usePackagePurchase()

    const [allPackages, setAllPackages] = useState<IPricingPlan[]>([])
    const [filteredPackages, setFilteredPackages] = useState<IPricingPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [highlightedId, setHighlightedId] = useState<number | null>(null)

    const [filters, setFilters] = useState<IFilterState>({
        category: 'all',
        maxPrice: 1000,
        minSpecialists: 0,
        minFacilities: 0,
        hasDental: false,
        hasHospital: false,
        hasRehabilitation: false,
        sortOrder: 'default'
    })

    const {addToComparison, removeFromComparison, isInComparison} = useComparison();
    const location = useLocation()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await fetch(API_URL)
                const data: IPricingPlan[] = await response.json()
                const cleanData = data.map((p) => ({
                    ...p,
                    priceValue: p.priceValue || 0
                }));
                setAllPackages(cleanData)
                setFilteredPackages(cleanData)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        let result = allPackages;
        if (filters.category !== 'all') result = result.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
        result = result.filter(p => p.priceValue <= filters.maxPrice)
        if (filters.hasDental) result = result.filter(p => p.hasDentalCare)
        if (filters.hasHospital) result = result.filter(p => p.hasHospitalization)

        setFilteredPackages(result)

        if (!location.state?.highlightPackageId)
            setCurrentPage(1)

    }, [filters, allPackages])

    useEffect(() => {
        if (!loading && filteredPackages.length > 0 && location.state?.highlightPackageId) {
            const targetId = location.state.highlightPackageId;
            const index = filteredPackages.findIndex(p => p.id === targetId);

            if (index !== -1) {
                const targetPage = Math.ceil((index + 1) / ITEMS_PER_PAGE);
                if (currentPage !== targetPage) setCurrentPage(targetPage);

                setTimeout(() => {
                    const element = document.getElementById(`package-card-${targetId}`);
                    if (element) {
                        element.scrollIntoView({behavior: 'smooth', block: 'center'});
                        setHighlightedId(targetId);
                        setTimeout(() => setHighlightedId(null), 2500);
                    }
                }, 500)
            }
            window.history.replaceState({}, document.title)
        }
    }, [loading, filteredPackages, location.state])

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredPackages.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber)
        document.getElementById('catalog-list')?.scrollIntoView({behavior: 'smooth', block: 'start'})
    }

    return (
        <section className="py-20 px-4 bg-slate-50 border-t border-gray-200" id="full-catalog">
            <div className="container mx-auto max-w-7xl">

                <div className="text-center mb-12">
                    <span className="text-[#4E61F6] font-bold tracking-wider uppercase text-sm">Pełna oferta</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Znajdź idealne
                        ubezpieczenie</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Przeglądaj wszystkie dostępne pakiety ({filteredPackages.length}), korzystaj z filtrów i
                        porównuj oferty.
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
                                <div
                                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E61F6] mb-4"></div>
                                <p>Ładowanie ofert...</p>
                            </div>
                        ) : filteredPackages.length === 0 ? (
                            <div
                                className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Nie znaleziono pakietów</h3>
                                <Button variant="secondary" onClick={() => setFilters({
                                    category: 'all',
                                    maxPrice: 1000,
                                    minSpecialists: 0,
                                    minFacilities: 0,
                                    hasDental: false,
                                    hasHospital: false,
                                    hasRehabilitation: false,
                                    sortOrder: 'default'
                                })}>Zresetuj filtry</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {currentItems.map((pkg) => (
                                    <div key={pkg.id} id={`package-card-${pkg.id}`} className={`
                                            group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col md:flex-row overflow-hidden 
                                            ${pkg.isFeatured ? 'border-blue-200 ring-1 ring-blue-50' : 'border-gray-100'}
                                            ${highlightedId === pkg.id ? 'ring-4 ring-[#4E61F6] scale-[1.02] shadow-2xl border-[#4E61F6] z-10' : ''}
                                        `}>
                                        <div className="flex-grow p-6 md:p-8 pl-8 relative">
                                            <div className="flex flex-col items-start mb-4 pr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {pkg.isFeatured && (
                                                        <span
                                                            className="inline-block bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                                            Polecany
                                                        </span>
                                                    )}
                                                    <span
                                                        className="text-xs font-bold text-gray-400 uppercase tracking-wider">{pkg.category}</span>
                                                </div>

                                                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-[#4E61F6] transition-colors mt-1">
                                                    {pkg.name}
                                                </h3>

                                                <div className="mt-2">
                                                    <Rating rating={pkg.averageRating} reviews={pkg.reviews}
                                                            className="flex items-center gap-1 !mt-0 !mb-0"/>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mb-5 pb-4 border-b border-gray-50 text-sm line-clamp-2">
                                                {pkg.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                <span
                                                    className="inline-flex items-center bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                                                    👨‍⚕️ {pkg.specialistsCount} Specjalistów
                                                </span>
                                                {pkg.hasDentalCare && <span
                                                    className="inline-flex items-center bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-teal-100">🦷 Stomatolog</span>}
                                                {pkg.hasHospitalization && <span
                                                    className="inline-flex items-center bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-100">🏥 Szpital</span>}
                                            </div>
                                        </div>

                                        <div
                                            className="md:w-72 bg-gray-50/30 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col justify-between gap-6">
                                            <div className="flex justify-between items-start">
                                                <div className="text-right flex-grow">
                                                    <div className="flex items-baseline justify-end gap-1">
                                                        <span
                                                            className="text-3xl font-extrabold text-[#4E61F6]">{pkg.price}</span>
                                                        <span className="text-xs text-gray-400 font-medium">/ mc</span>
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-500 text-right">
                                                        {pkg.facilitiesCount} placówek
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <FavoriteButton packageId={pkg.id}
                                                                    className="bg-white shadow-sm border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-400"/>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mt-auto">
                                                <Button variant="primary" className="w-full !py-2.5 text-sm shadow-md"
                                                        onClick={() => openModal(pkg)}>
                                                    Szczegóły oferty
                                                </Button>

                                                <label
                                                    className={`flex items-center justify-center cursor-pointer w-full py-2 rounded-lg border transition-all ${isInComparison(pkg.id) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={isInComparison(pkg.id)}
                                                        onChange={() => {
                                                            if (isInComparison(pkg.id)) removeFromComparison(pkg.id);
                                                            else addToComparison(pkg);
                                                        }}
                                                    />
                                                    <span
                                                        className="text-xs font-bold uppercase tracking-wide">{isInComparison(pkg.id) ? "Wybrano" : "+ Porównaj"}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-12 gap-2">
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}
                                        className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">&larr;</button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => paginate(i + 1)}
                                            className={`w-10 h-10 rounded-lg text-sm font-bold ${currentPage === i + 1 ? 'bg-[#4E61F6] text-white' : 'bg-white border'}`}>{i + 1}</button>
                                ))}
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}
                                        className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Następna &rarr;</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={selectedPlan !== null} onClose={closeModal} className="max-w-3xl">
                {selectedPlan && (
                    <div className="text-gray-800 relative">

                        <div
                            className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b border-gray-100 pb-6 pt-6">
                            <div className="flex-grow">
                                <span
                                    className="inline-block bg-blue-50 text-[#4E61F6] text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wide">{selectedPlan.category}</span>
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                                <div
                                    className="text-xs bg-indigo-50 px-3 py-2 rounded text-indigo-700 font-medium border border-indigo-100">👨‍⚕️ {selectedPlan.specialistsCount} Specjalistów
                                </div>
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

            <ComparisonBar/>
        </section>
    )
}