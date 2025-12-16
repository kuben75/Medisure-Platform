import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PackageFilters from '../../components/ui/PackageFilters.tsx';
import Button from '../../components/ui/Button.tsx';
import Rating from '../../components/ui/Rating.tsx';
import { useComparison } from "../../hooks/useComparison.ts";
import ComparisonBar from "../../components/ui/ComparisonBar.tsx";
import type { IFilterState, IPricingPlan } from "../../types/pricing.types.ts";
import FavoriteButton from "../../components/ui/FavouriteButton.tsx";
import { usePackagePurchase } from "../../hooks/usePackagePurchase.ts";
import {Link, useLocation, useSearchParams} from "react-router-dom";
import SpecialistsListModal from "../../components/ui/SpecialistsListModal.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import { useFavorites } from "../../hooks/UseFavourites.ts";
import CheckoutOverlay from "../../components/ui/CheckoutOverlay.tsx";
import { calculatePersonalizedPrice } from "../../utils/pricingHelpers.ts";
import PackageDetailsModal from "../../components/ui/PackageDetailsModal.tsx";
import { SPECIALISTS_LIST } from "../../constants/specialists.tsx";
const API_URL = `${import.meta.env.VITE_API_URL}/packages`
const ITEMS_PER_PAGE = 5

const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-purple-600"><path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" /></svg>;

const BestMatchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
    </svg>
)

export default function PackageCatalog() {
    const { user } = useAuth()
    const [searchParams] = useSearchParams();
    const {selectedPlan, selectedDuration, setSelectedDuration, billingPeriod, setBillingPeriod, openModal,
        closeModal, priceDetails, isCheckoutOpen, handleProceedToCheckout, closeCheckout, finalizePurchase,
        options, isBuying
    } = usePackagePurchase()

    const { isFavorite } = useFavorites()
    const [specModalOpen, setSpecModalOpen] = useState(false)
    const [specModalData, setSpecModalData] = useState<{ name: string } | null>(null)
    const [allPackages, setAllPackages] = useState<IPricingPlan[]>([])
    const [filteredPackages, setFilteredPackages] = useState<IPricingPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [highlightedId, setHighlightedId] = useState<number | null>(null)
    const hasScrolledToPackage = useRef(false);
    const [showPersonalizedPricing, setShowPersonalizedPricing] = useState(true);

    const { addToComparison, removeFromComparison, isInComparison } = useComparison()
    const location = useLocation()

    const userAge = useMemo(() => {
        if (user?.birthDate) {
            const birth = new Date(user.birthDate)
            const today = new Date()
            let age = today.getFullYear() - birth.getFullYear()
            const m = today.getMonth() - birth.getMonth()
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
            return age
        }
        return null
    }, [user])

    useEffect(() => {
        if (loading || allPackages.length === 0) return;

        if (location.state?.highlightPackageId) {
            const targetId = location.state.highlightPackageId;
            const targetPkg = allPackages.find(p => p.id === targetId);

            if (targetPkg) {
                setFilters(prev => ({
                    ...prev,
                    category: 'all',
                    searchQuery: '',
                    maxPrice: Math.max(prev.maxPrice, targetPkg.priceValue + 500)
                }));
                return;
            }
        }

        const categoryFromUrl = searchParams.get('category');
        const validCategories = ['Indywidualny', 'Rodzinny', 'Senior', 'Biznesowy'];

        if (categoryFromUrl && validCategories.includes(categoryFromUrl)) {
            setFilters(prev => ({
                ...prev,
                category: categoryFromUrl,
                searchQuery: '',
                maxPrice: 10000
            }));

            setTimeout(() => {
                const catalogSection = document.getElementById('full-catalog');
                if (catalogSection) {
                    catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [loading, allPackages, location.state, searchParams])

    useEffect(() => {
        setHighlightedId(null)
    }, [showPersonalizedPricing])

    useEffect(() => {
        if (userAge !== null)
            setShowPersonalizedPricing(true)
        else
            setShowPersonalizedPricing(false)
    }, [userAge])

    const getPersonalizedPrice = useCallback((basePrice: number, category: string) => {
        return calculatePersonalizedPrice(basePrice, category, userAge);
    }, [userAge]);

    const checkBestMatch = useCallback((pkg: IPricingPlan) => {
        if (userAge === null) return false
        if (userAge >= 60 && pkg.category === 'Senior') return true
        if (userAge >= 18 && userAge < 30 && (pkg.name.includes("Podstawowy") || pkg.name.includes("Start"))) return true
        if (userAge >= 30 && userAge < 60 && (pkg.name.includes("Komfort") || pkg.name.includes("Prestige"))) return true
        return false
    }, [userAge])

    const handleOpenPackageDetails = (pkg: IPricingPlan) => {
        let packageToOpen = pkg;

        if (showPersonalizedPricing) {
            const personalizedPrice = getPersonalizedPrice(pkg.priceValue, pkg.category);
            packageToOpen = {
                ...pkg,
                priceValue: personalizedPrice,
            };
        }

        openModal(packageToOpen);
    };

    const handleOpenSpecs = (e: React.MouseEvent, pkg: IPricingPlan) => {
        e.stopPropagation()
        setSpecModalData({ name: pkg.name })
        setSpecModalOpen(true)
    }

    const [filters, setFilters] = useState<IFilterState>({
        category: 'all',
        maxPrice: 2000,
        minSpecialists: 0,
        minFacilities: 0,
        hasDental: false,
        hasHospital: false,
        hasRehabilitation: false,
        searchQuery: '',
        showYearlyPrice: false,
        sortOrder: 'default'
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await fetch(API_URL)
                const data: IPricingPlan[] = await response.json()
                const cleanData = data.map((p) => ({
                    ...p,
                    priceValue: p.priceValue || 0,
                    specialistsCount: p.specialistsCount || 0
                }))
                setAllPackages(cleanData)
                setFilteredPackages(cleanData)
            } catch (error) {
                console.error("Błąd pobierania pakietów:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        let result = [...allPackages]

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            )
        }

        if (filters.category !== 'all')
            result = result.filter(p => p.category.toLowerCase() === filters.category.toLowerCase())

        const currentMaxPrice = filters.showYearlyPrice ? filters.maxPrice / 12 : filters.maxPrice

        result = result.filter(p => {
            const priceToCheck = showPersonalizedPricing
                ? getPersonalizedPrice(p.priceValue, p.category)
                : p.priceValue
            return priceToCheck <= currentMaxPrice
        });

        if (filters.minSpecialists > 0) result = result.filter(p => p.specialistsCount >= filters.minSpecialists)
        if (filters.minFacilities > 0) result = result.filter(p => p.facilitiesCount >= filters.minFacilities)
        if (filters.hasDental) result = result.filter(p => p.hasDentalCare)
        if (filters.hasHospital) result = result.filter(p => p.hasHospitalization)
        if (filters.hasRehabilitation) result = result.filter(p => p.hasRehabilitation)

        result.sort((a, b) => {
            const favA = isFavorite(a.id) ? 1 : 0
            const favB = isFavorite(b.id) ? 1 : 0
            if (favA !== favB) return favB - favA

            const categoryOrder: Record<string, number> = {
                'Indywidualny': 1, 'Rodzinny': 2, 'Senior': 3, 'Biznesowy': 4
            }

            if (filters.sortOrder === 'default') {
                if (showPersonalizedPricing) {
                    const matchA = checkBestMatch(a) ? 1 : 0
                    const matchB = checkBestMatch(b) ? 1 : 0
                    if (matchA !== matchB) return matchB - matchA
                }
                const orderA = categoryOrder[a.category] || 99
                const orderB = categoryOrder[b.category] || 99
                if (orderA !== orderB) return orderA - orderB

                const priceA = showPersonalizedPricing ? getPersonalizedPrice(a.priceValue, a.category) : a.priceValue;
                const priceB = showPersonalizedPricing ? getPersonalizedPrice(b.priceValue, b.category) : b.priceValue;
                return priceA - priceB;
            }
            const getPriceForSort = (p: IPricingPlan) => showPersonalizedPricing ? getPersonalizedPrice(p.priceValue, p.category) : p.priceValue;

            switch (filters.sortOrder) {
                case 'price_asc': return getPriceForSort(a) - getPriceForSort(b);
                case 'price_desc': return getPriceForSort(b) - getPriceForSort(a);
                case 'rating_desc': return b.averageRating - a.averageRating;
                case 'rating_asc': return a.averageRating - b.averageRating;
                default: return 0;
            }
        });

        setFilteredPackages(result)

        if (!location.state?.highlightPackageId && !hasScrolledToPackage.current) {
            setCurrentPage(1)
        }
    }, [filters, allPackages, userAge, getPersonalizedPrice, isFavorite, location.state, showPersonalizedPricing, checkBestMatch])

    useEffect(() => {
        if (!loading && filteredPackages.length > 0 && location.state?.highlightPackageId && !hasScrolledToPackage.current) {
            const targetId = location.state.highlightPackageId;
            const index = filteredPackages.findIndex(p => p.id === targetId);
            if (index !== -1) {
                const targetPage = Math.ceil((index + 1) / ITEMS_PER_PAGE);
                if (currentPage !== targetPage) setCurrentPage(targetPage);
                setTimeout(() => {
                    const element = document.getElementById(`package-card-${targetId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setHighlightedId(targetId);
                        hasScrolledToPackage.current = true;
                        setTimeout(() => setHighlightedId(null), 2500);
                        window.history.replaceState({}, document.title);
                    }
                }, 500)
            }
        }
    }, [loading, filteredPackages, location.state, currentPage])

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredPackages.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber)
        document.getElementById('catalog-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <section className="py-20 px-4 bg-slate-50 border-t border-gray-200" id="full-catalog">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-8">
                    <span className="text-[#4E61F6] font-bold tracking-wider uppercase text-sm">Pełna oferta</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Znajdź idealne ubezpieczenie</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Przeglądaj wszystkie dostępne pakiety ({filteredPackages.length}), korzystaj z filtrów i porównuj oferty.
                    </p>

                    {userAge !== null && (
                        <div className="mt-6 flex justify-center animate-fade-in">
                            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-purple-100">
                                <button
                                    onClick={() => setShowPersonalizedPricing(false)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!showPersonalizedPricing ? 'bg-gray-100 text-gray-700 shadow-inner' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Ceny katalogowe
                                </button>
                                <button
                                    onClick={() => setShowPersonalizedPricing(true)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${showPersonalizedPricing ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-purple-600'}`}
                                >
                                    <SparklesIcon />
                                    Dopasowane do mnie ({userAge} lat)
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-1/4 flex-shrink-0 transition-all duration-300">
                        <div className="sticky top-24">
                            <PackageFilters filters={filters} setFilters={setFilters} />
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
                                    maxPrice: 2000,
                                    minSpecialists: 0,
                                    minFacilities: 0,
                                    hasDental: false,
                                    hasHospital: false,
                                    hasRehabilitation: false,
                                    sortOrder: 'default',
                                    searchQuery: '',
                                    showYearlyPrice: false,
                                })}>Zresetuj filtry</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {currentItems.map((pkg) => {
                                    const realSpecialistsCount = SPECIALISTS_LIST.filter(s =>
                                        s.availableInPackages.includes(pkg.name)
                                    ).length
                                    const isBusiness = pkg.category === 'Biznesowy'
                                    const personalizedPrice = getPersonalizedPrice(pkg.priceValue, pkg.category)
                                    const basePrice = pkg.priceValue

                                    const priceToDisplayBase = showPersonalizedPricing ? personalizedPrice : basePrice
                                    const displayPrice = filters.showYearlyPrice ? (priceToDisplayBase * 12).toFixed(0) : priceToDisplayBase

                                    const isPriceIncreased = userAge !== null && personalizedPrice > basePrice
                                    const isBestMatch = checkBestMatch(pkg)
                                    const isHighlighted = highlightedId === pkg.id

                                    let cardClasses = "group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col md:flex-row overflow-hidden relative";

                                    if (isHighlighted) {
                                        cardClasses += " border-[#4E61F6] ring-4 ring-[#4E61F6]/20 z-10 scale-[1.02]";
                                    } else if (isBestMatch) {
                                        cardClasses += " border-indigo-200 ring-1 ring-indigo-50";
                                    } else {
                                        cardClasses += " border-gray-100";
                                    }

                                    return (
                                        <div key={pkg.id} id={`package-card-${pkg.id}`} className={cardClasses}>
                                            {isBestMatch && !isHighlighted && (
                                                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center shadow-md animate-fade-in">
                                                    <BestMatchIcon />
                                                    IDEALNY DLA CIEBIE
                                                </div>
                                            )}

                                            {pkg.isFeatured && !isBestMatch && !isHighlighted && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#4E61F6]"></div>
                                            )}

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

                                                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-[#4E61F6] transition-colors mt-1">
                                                        {pkg.name}
                                                    </h3>

                                                    <div className="mt-2">
                                                        <Rating rating={pkg.averageRating} reviews={pkg.reviews} className="flex items-center gap-1 !mt-0 !mb-0" />
                                                    </div>
                                                </div>

                                                <p className="text-gray-600 mb-5 pb-4 border-b border-gray-50 text-sm line-clamp-2">
                                                    {pkg.description}
                                                </p>

                                                <div className="flex flex-wrap gap-2">
                                                    <span
                                                        onClick={(e) => handleOpenSpecs(e, pkg)}
                                                        className="inline-flex items-center bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors"
                                                        title="Kliknij, aby zobaczyć listę">
                                                        👨‍⚕️ {realSpecialistsCount} Specjalistów
                                                    </span>
                                                    {pkg.hasDentalCare && <span className="inline-flex items-center bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-teal-100">🦷 Stomatolog</span>}
                                                    {pkg.hasHospitalization && <span className="inline-flex items-center bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-100">🏥 Szpital</span>}
                                                </div>
                                            </div>

                                            <div className="md:w-72 bg-gray-50/30 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col justify-between gap-6">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-right flex-grow">
                                                        <div className="flex flex-col items-end">
                                                            {showPersonalizedPricing && isPriceIncreased && (
                                                                <div className="flex items-center gap-1 text-xs text-purple-600 font-semibold mb-1 bg-purple-100 px-2 py-0.5 rounded-full">
                                                                    <SparklesIcon /> Cena indywidualna
                                                                </div>
                                                            )}
                                                            {!showPersonalizedPricing && (
                                                                <span className="text-xs text-gray-500 font-medium mb-0.5">Cena od:</span>
                                                            )}
                                                            <div className="flex items-baseline justify-end gap-1">
                                                                <span className={`text-3xl font-extrabold ${showPersonalizedPricing && isPriceIncreased ? 'text-purple-600' : 'text-[#4E61F6]'}`}>
                                                                    {displayPrice}
                                                                </span>
                                                                <span className="text-2xl text-gray-400 font-bold text-sm">zł</span>
                                                            </div>
                                                            {isBusiness && (
                                                                <div className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wide">
                                                                    Cena netto / osoba
                                                                </div>
                                                            )}
                                                            <span className="text-xs text-gray-400 font-medium">
                                                                {!isBusiness && (`/ ${filters.showYearlyPrice ? 'rok' : 'mc'}`)}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500 text-right">{pkg.facilitiesCount} placówek</div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <FavoriteButton packageId={pkg.id} className="bg-white shadow-sm hover:bg-red-50" />
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mt-auto">
                                                    {isBusiness ? (
                                                        <Link to="/kontakt" className="w-full block">
                                                            <Button variant="secondary" className="w-full !py-2.5 text-sm shadow-md border-blue-200 text-blue-700 hover:bg-blue-50">
                                                                Poproś o ofertę dla firmy
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button variant="primary" className="w-full !py-2.5 text-sm shadow-md" onClick={() => handleOpenPackageDetails(pkg)}>
                                                            Szczegóły oferty
                                                        </Button>
                                                    )}
                                                    {!isBusiness && (
                                                        <label className={`flex items-center justify-center cursor-pointer w-full py-2 rounded-lg border transition-all ${isInComparison(pkg.id) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                                                            <input type="checkbox" className="hidden" checked={isInComparison(pkg.id)} onChange={() => { if (isInComparison(pkg.id)) removeFromComparison(pkg.id); else addToComparison(pkg); }} />
                                                            <span className="text-xs font-bold uppercase tracking-wide">{isInComparison(pkg.id) ? "Wybrano" : "+ Porównaj"}</span>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-12 gap-2">
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">&larr;</button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => paginate(i + 1)} className={`w-10 h-10 rounded-lg text-sm font-bold ${currentPage === i + 1 ? 'bg-[#4E61F6] text-white' : 'bg-white border'}`}>{i + 1}</button>
                                ))}
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Następna &rarr;</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <PackageDetailsModal
                isOpen={selectedPlan !== null && !isCheckoutOpen}
                onClose={closeModal}
                plan={selectedPlan}
                userAge={userAge || undefined}
                selectedDuration={selectedDuration}
                onDurationChange={setSelectedDuration}
                billingPeriod={billingPeriod}
                setBillingPeriod={setBillingPeriod}
                onProceedToCheckout={handleProceedToCheckout}
                options={options}
                priceDetails={priceDetails}
                isBuying={isBuying}
            />

            <ComparisonBar />
            {specModalData && (
                <SpecialistsListModal
                    isOpen={specModalOpen}
                    onClose={() => setSpecModalOpen(false)}
                    packageName={specModalData.name}
                />
            )}

            {selectedPlan && (
                <CheckoutOverlay
                    isOpen={isCheckoutOpen}
                    onClose={closeCheckout}
                    plan={selectedPlan}
                    priceDetails={priceDetails}
                    onFinalize={finalizePurchase}
                    billingPeriod={billingPeriod}
                />
            )}
        </section>
    )
}