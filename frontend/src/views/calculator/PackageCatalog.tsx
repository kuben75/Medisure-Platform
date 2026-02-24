import PackageFilters from '../../components/ui/packages/PackageFilters.tsx';
import PackageCard from '../../components/ui/packages/PackageCard.tsx';
import Button from '../../components/ui/Button.tsx';
import ComparisonBar from "../../components/ui/ComparisonBar.tsx";
import SpecialistsListModal from "../../components/ui/modals/SpecialistsListModal.tsx";
import CheckoutOverlay from "../../components/ui/CheckoutOverlay.tsx";
import PackageDetailsModal from "../../components/ui/modals/PackageDetailsModal.tsx";
import SparklesIcon from "../../components/icons/SparklesIcon.tsx";
import {useComparison} from "../../hooks/useComparison.ts";
import {usePackagePurchase} from "../../hooks/usePackagePurchase.ts";
import {usePackageCatalog} from "../../hooks/usePackageCatalog.ts";
import type {IPricingPlan} from "../../types/pricing.types.ts";

export default function PackageCatalog() {

    const {
        loading,
        filteredPackages,
        totalPages,
        currentPage,
        highlightedId,
        userAge,
        filters, setFilters,
        showPersonalizedPricing, setShowPersonalizedPricing,
        specModalOpen, setSpecModalOpen,
        specModalData,
        getPersonalizedPrice,
        checkBestMatch,
        handleOpenSpecs,
        paginate
    } = usePackageCatalog();


    const {
        selectedPlan, selectedDuration, setSelectedDuration, billingPeriod, setBillingPeriod,
        openModal, closeModal, priceDetails, isCheckoutOpen, handleProceedToCheckout,
        closeCheckout, finalizePurchase, options, isBuying
    } = usePackagePurchase();


    const {addToComparison, removeFromComparison, isInComparison} = useComparison();


    const handleOpenPackageDetails = (pkg: IPricingPlan) => {
        let packageToOpen = pkg;
        if (showPersonalizedPricing) {
            const personalizedPrice = getPersonalizedPrice(pkg.priceValue, pkg.category);
            packageToOpen = {...pkg, priceValue: personalizedPrice};
        }
        openModal(packageToOpen);
    };

    return (
        <section className="py-20 px-4 bg-white border-t border-gray-200" id="full-catalog">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-8">
                    <span className="text-[#4E61F6] font-bold tracking-wider uppercase text-sm">Pełna oferta</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Znajdź idealne
                        ubezpieczenie</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Przeglądaj wszystkie dostępne pakiety, korzystaj z filtrów i porównuj oferty.
                    </p>

                    {userAge !== null && (
                        <div className="mt-6 flex justify-center animate-fade-in">
                            <div
                                className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-purple-100">
                                <button onClick={() => setShowPersonalizedPricing(false)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!showPersonalizedPricing ? 'bg-gray-100 text-gray-700 shadow-inner' : 'text-gray-500 hover:text-gray-700'}`}>Ceny
                                    katalogowe
                                </button>
                                <button onClick={() => setShowPersonalizedPricing(true)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${showPersonalizedPricing ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-purple-600'}`}>
                                    <SparklesIcon/> Dopasowane do mnie ({userAge} lat)
                                </button>
                            </div>
                        </div>
                    )}
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
                                    showYearlyPrice: false
                                })}>
                                    Zresetuj filtry
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredPackages.map((pkg) => {
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

            <ComparisonBar/>

            {specModalData && (
                <SpecialistsListModal
                    isOpen={specModalOpen}
                    onClose={() => setSpecModalOpen(false)}
                    packageName={specModalData.name}
                    includedSpecializations={specModalData.includedSpecs}
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
    );
}