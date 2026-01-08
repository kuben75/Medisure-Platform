import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams, useLocation } from "react-router-dom"
import PackageFilters from '../../components/ui/PackageFilters.tsx'
import PackageCard from '../../components/ui/PackageCard.tsx'
import Button from '../../components/ui/Button.tsx'
import ComparisonBar from "../../components/ui/ComparisonBar.tsx"
import SpecialistsListModal from "../../components/ui/modals/SpecialistsListModal.tsx"
import CheckoutOverlay from "../../components/ui/CheckoutOverlay.tsx"
import PackageDetailsModal from "../../components/ui/modals/PackageDetailsModal.tsx"

import { useComparison } from "../../hooks/useComparison.ts"
import { usePackagePurchase } from "../../hooks/usePackagePurchase.ts"
import { useAuth } from "../../hooks/useAuth.ts"
import { useFavorites } from "../../hooks/UseFavourites.ts"
import { calculatePersonalizedPrice } from "../../utils/pricingHelpers.ts"
import type { IFilterState, IPricingPlan } from "../../types/pricing.types.ts"
import SparklesIcon from "../../components/icons/SparklesIcon.tsx"

const API_URL = `${import.meta.env.VITE_API_URL}/packages`
const ITEMS_PER_PAGE = 5

export default function PackageCatalog() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const {
        selectedPlan, selectedDuration, setSelectedDuration, billingPeriod, setBillingPeriod,
        openModal, closeModal, priceDetails, isCheckoutOpen, handleProceedToCheckout,
        closeCheckout, finalizePurchase, options, isBuying
    } = usePackagePurchase()

    const { isFavorite } = useFavorites();
    const { addToComparison, removeFromComparison, isInComparison } = useComparison()

    const [specModalOpen, setSpecModalOpen] = useState(false)
    const [specModalData, setSpecModalData] = useState<{ name: string } | null>(null)
    const [allPackages, setAllPackages] = useState<IPricingPlan[]>([])
    const [filteredPackages, setFilteredPackages] = useState<IPricingPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [highlightedId, setHighlightedId] = useState<number | null>(null)
    const [showPersonalizedPricing, setShowPersonalizedPricing] = useState(true)

    const hasScrolledToPackage = useRef(false)

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
        if (loading || allPackages.length === 0) return;

        if (location.state?.highlightPackageId) {
            const targetId = location.state.highlightPackageId;
            const targetPkg = allPackages.find(p => p.id === targetId);
            if (targetPkg) {
                setFilters(prev => ({ ...prev, category: 'all', searchQuery: '', maxPrice: Math.max(prev.maxPrice, targetPkg.priceValue + 500) }));
                return;
            }
        }

        const categoryFromUrl = searchParams.get('category');
        const validCategories = ['Indywidualny', 'Rodzinny', 'Senior', 'Biznesowy'];
        if (categoryFromUrl && validCategories.includes(categoryFromUrl)) {
            setFilters(prev => ({ ...prev, category: categoryFromUrl, searchQuery: '', maxPrice: 10000 }));
            setTimeout(() => document.getElementById('full-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }, [loading, allPackages, location.state, searchParams])

    useEffect(() => {
        setShowPersonalizedPricing(userAge !== null)
        setHighlightedId(null);
    }, [userAge]);

    const getPersonalizedPrice = useCallback((basePrice: number, category: string) => {
        return calculatePersonalizedPrice(basePrice, category, userAge);
    }, [userAge]);

    const checkBestMatch = useCallback((pkg: IPricingPlan) => {
        if (userAge === null) return false;
        if (userAge >= 60 && pkg.category === 'Senior') return true;
        if (userAge >= 18 && userAge < 30 && (pkg.name.includes("Podstawowy") || pkg.name.includes("Start"))) return true;
        if (userAge >= 30 && userAge < 60 && (pkg.name.includes("Komfort") || pkg.name.includes("Prestige"))) return true;
        return false
    }, [userAge])

    useEffect(() => {
        let result = [...allPackages];

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase()
            result = result.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
        }

        if (filters.category !== 'all') result = result.filter(p => p.category.toLowerCase() === filters.category.toLowerCase())

        const currentMaxPrice = filters.showYearlyPrice ? filters.maxPrice / 12 : filters.maxPrice
        result = result.filter(p => {
            const priceToCheck = showPersonalizedPricing ? getPersonalizedPrice(p.priceValue, p.category) : p.priceValue
            return priceToCheck <= currentMaxPrice
        })

        if (filters.minSpecialists > 0) result = result.filter(p => p.specialistsCount >= filters.minSpecialists)
        if (filters.minFacilities > 0) result = result.filter(p => p.facilitiesCount >= filters.minFacilities)
        if (filters.hasDental) result = result.filter(p => p.hasDentalCare)
        if (filters.hasHospital) result = result.filter(p => p.hasHospitalization)
        if (filters.hasRehabilitation) result = result.filter(p => p.hasRehabilitation)

        result.sort((a, b) => {
            const favA = isFavorite(a.id) ? 1 : 0
            const favB = isFavorite(b.id) ? 1 : 0
            if (favA !== favB) return favB - favA

            const categoryOrder: Record<string, number> = { 'Indywidualny': 1, 'Rodzinny': 2, 'Senior': 3, 'Biznesowy': 4 }

            if (filters.sortOrder === 'default') {
                if (showPersonalizedPricing) {
                    const matchA = checkBestMatch(a) ? 1 : 0
                    const matchB = checkBestMatch(b) ? 1 : 0
                    if (matchA !== matchB) return matchB - matchA
                }
                const orderA = categoryOrder[a.category] || 99
                const orderB = categoryOrder[b.category] || 99
                if (orderA !== orderB) return orderA - orderB

                const priceA = showPersonalizedPricing ? getPersonalizedPrice(a.priceValue, a.category) : a.priceValue
                const priceB = showPersonalizedPricing ? getPersonalizedPrice(b.priceValue, b.category) : b.priceValue
                return priceA - priceB
            }

            const getPriceForSort = (p: IPricingPlan) => showPersonalizedPricing ? getPersonalizedPrice(p.priceValue, p.category) : p.priceValue;

            switch (filters.sortOrder) {
                case 'price_asc': return getPriceForSort(a) - getPriceForSort(b)
                case 'price_desc': return getPriceForSort(b) - getPriceForSort(a)
                case 'rating_desc': return b.averageRating - a.averageRating
                case 'rating_asc': return a.averageRating - b.averageRating
                default: return 0
            }
        });

        setFilteredPackages(result);
        if (!location.state?.highlightPackageId && !hasScrolledToPackage.current) setCurrentPage(1);
    }, [filters, allPackages, userAge, getPersonalizedPrice, isFavorite, location.state, showPersonalizedPricing, checkBestMatch]);

    useEffect(() => {
        if (!loading && filteredPackages.length > 0 && location.state?.highlightPackageId && !hasScrolledToPackage.current) {
            const targetId = location.state.highlightPackageId
            const index = filteredPackages.findIndex(p => p.id === targetId)
            if (index !== -1) {
                const targetPage = Math.ceil((index + 1) / ITEMS_PER_PAGE)
                if (currentPage !== targetPage) setCurrentPage(targetPage)
                setTimeout(() => {
                    const element = document.getElementById(`package-card-${targetId}`)
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        setHighlightedId(targetId);
                        hasScrolledToPackage.current = true;
                        setTimeout(() => setHighlightedId(null), 2500)
                        window.history.replaceState({}, document.title);
                    }
                }, 500)
            }
        }
    }, [loading, filteredPackages, location.state, currentPage])

    const handleOpenPackageDetails = (pkg: IPricingPlan) => {
        let packageToOpen = pkg
        if (showPersonalizedPricing) {
            const personalizedPrice = getPersonalizedPrice(pkg.priceValue, pkg.category)
            packageToOpen = { ...pkg, priceValue: personalizedPrice }
        }
        openModal(packageToOpen)
    }

    const handleOpenSpecs = (e: React.MouseEvent, pkg: IPricingPlan) => {
        e.stopPropagation()
        setSpecModalData({ name: pkg.name })
        setSpecModalOpen(true)
    }

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber)
        document.getElementById('catalog-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
    const currentItems = filteredPackages.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE)

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
                                <button onClick={() => setShowPersonalizedPricing(false)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!showPersonalizedPricing ? 'bg-gray-100 text-gray-700 shadow-inner' : 'text-gray-500 hover:text-gray-700'}`}>Ceny katalogowe</button>
                                <button onClick={() => setShowPersonalizedPricing(true)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${showPersonalizedPricing ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-purple-600'}`}>
                                    <SparklesIcon /> Dopasowane do mnie ({userAge} lat)
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
                                <Button variant="secondary" onClick={() => setFilters({ category: 'all', maxPrice: 2000, minSpecialists: 0, minFacilities: 0, hasDental: false, hasHospital: false, hasRehabilitation: false, sortOrder: 'default', searchQuery: '', showYearlyPrice: false })}>
                                    Zresetuj filtry
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {currentItems.map((pkg) => {
                                    const personalizedPrice = getPersonalizedPrice(pkg.priceValue, pkg.category);
                                    const basePrice = pkg.priceValue;
                                    const priceToDisplayBase = showPersonalizedPricing ? personalizedPrice : basePrice;
                                    const displayPrice = filters.showYearlyPrice ? (priceToDisplayBase * 12).toFixed(0) : priceToDisplayBase;
                                    const isPriceIncreased = userAge !== null && personalizedPrice > basePrice;

                                    return (
                                        <PackageCard
                                            key={pkg.id}
                                            pkg={pkg}
                                            isHighlighted={highlightedId === pkg.id}
                                            isBestMatch={checkBestMatch(pkg)}
                                            displayPrice={displayPrice}
                                            isPriceIncreased={isPriceIncreased}
                                            showPersonalizedPricing={showPersonalizedPricing}
                                            showYearlyPrice={filters.showYearlyPrice}
                                            isInComparison={isInComparison(pkg.id)}
                                            onToggleComparison={() => isInComparison(pkg.id) ? removeFromComparison(pkg.id) : addToComparison(pkg)}
                                            onOpenSpecs={(e) => handleOpenSpecs(e, pkg)}
                                            onOpenDetails={() => handleOpenPackageDetails(pkg)}
                                        />
                                    );
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