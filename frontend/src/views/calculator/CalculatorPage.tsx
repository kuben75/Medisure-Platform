import HeroSectionCalculator from "../../components/sections/HeroSectionCalculator.tsx";
import CalculationResults from "./CalculationResults.tsx";
import PackageCatalog from "./PackageCatalog.tsx";
import CheckoutOverlay from "../../components/ui/CheckoutOverlay.tsx";
import PackageDetailsModal from "../../components/ui/modals/PackageDetailsModal.tsx";
import PriceFactorsSection from "../../components/sections/PriceFactorsSection.tsx";
import {usePackagePurchase} from "../../hooks/usePackagePurchase.ts";
import {useCalculatorLogic} from "../../hooks/useCalculatorLogic.ts";
import {calculatePersonalizedPrice} from "../../utils/pricingHelpers.ts";
import type {IPricingPlan} from "../../types/pricing.types.ts";

export default function CalculatorPage() {
    const {
        selectedPlan,
        selectedDuration,
        setSelectedDuration,
        billingPeriod,
        setBillingPeriod,
        openModal,
        closeModal,
        priceDetails,
        isCheckoutOpen,
        closeCheckout,
        finalizePurchase,
        handleProceedToCheckout,
        options,
        isBuying
    } = usePackagePurchase();

    const {
        isCalculated,
        loading,
        resultPrice,
        userAge,
        userType,
        recommendedPlan,
        budgetExceeded,
        calculatedAge,
        calculateSubscription
    } = useCalculatorLogic();

    const handleOpenRecommended = (pkg: IPricingPlan) => {
        const ageToUse = userAge || calculatedAge || 30;
        const personalizedPrice = calculatePersonalizedPrice(pkg.priceValue, pkg.category, ageToUse);
        const packageWithCustomPrice = {...pkg, priceValue: personalizedPrice};
        openModal(packageWithCustomPrice);
    };

    return (
        <div className="min-h-screen bg-white">
            <HeroSectionCalculator
                onCalculate={calculateSubscription}
                isCalculating={loading}
                initialAge={calculatedAge}
            />

            {isCalculated && (
                <CalculationResults
                    estimatedPrice={resultPrice}
                    packageType={userType}
                    age={userAge}
                    recommendedPlan={recommendedPlan}
                    budgetExceeded={budgetExceeded}
                    onShowDetails={(pkg) => handleOpenRecommended(pkg)}
                />
            )}

            <div className="border-t border-gray-100">
                <PackageCatalog/>
            </div>

            <PackageDetailsModal
                isOpen={selectedPlan !== null && !isCheckoutOpen}
                onClose={closeModal}
                plan={selectedPlan}
                userAge={userAge || calculatedAge}
                selectedDuration={selectedDuration}
                onDurationChange={setSelectedDuration}
                billingPeriod={billingPeriod}
                setBillingPeriod={setBillingPeriod}
                onProceedToCheckout={handleProceedToCheckout}
                options={options}
                priceDetails={priceDetails}
                isBuying={isBuying}
            />

            {selectedPlan && (
                <CheckoutOverlay
                    isOpen={isCheckoutOpen}
                    onClose={closeCheckout}
                    plan={selectedPlan}
                    priceDetails={priceDetails}
                    onFinalize={finalizePurchase}
                />
            )}

            <PriceFactorsSection/>
        </div>
    );
}