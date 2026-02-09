import Modal from "./Modal.tsx";
import Button from "../Button.tsx";
import CheckIcon from "../../icons/CheckIcon.tsx";
import FavoriteButton from "../FavouriteButton.tsx";
import ReviewsList from "../ReviewList.tsx";
import { useAuth } from "../../../hooks/useAuth.ts";
import { useEffect } from "react";
import type { IPackageDetailsModalProps } from "../../../types/ui.types.ts";
import ShieldCheckIcon from "../../icons/ShieldCheckIcon.tsx";

export default function PackageDetailsModal({isOpen, onClose, plan, userAge, selectedDuration, onDurationChange, billingPeriod, setBillingPeriod, onProceedToCheckout, options, priceDetails, isBuying}: IPackageDetailsModalProps) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
         else document.body.style.overflow = 'unset'

        return () => {
            document.body.style.overflow = 'unset'
        }

    }, [isOpen])
    const { user } = useAuth()

    if (!plan) return null

    const isTestPeriod = selectedDuration === '7d'

    const selectedOptionData = options.find(o => o.id === selectedDuration)
    const currentDiscount = selectedOptionData?.discount || 0
    const hasDiscount = currentDiscount > 0
    const months = selectedOptionData?.months || 12

    const baseMonthlyPrice = plan.priceValue

    const upfrontOriginalTotal = baseMonthlyPrice * months

    const upfrontDiscountedTotal = upfrontOriginalTotal * (1 - currentDiscount)

    const displayMonthlyCardPrice = Math.round(baseMonthlyPrice)
    const displayUpfrontCardPrice = isTestPeriod ? 1 : Math.round(upfrontDiscountedTotal)

    const featuresList = typeof plan.features === 'string'
        ? plan.features.split(';').map(f => f.trim()).filter(Boolean)
        : (Array.isArray(plan.features) ? plan.features : [])


    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl w-full mx-2 sm:mx-4">
            <div className="text-gray-800 relative bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 mt-4">

                <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6 mb-6 border-b border-gray-100 pb-6">
                    <div className="flex-grow w-full md:w-auto">
                    <span className="inline-block bg-blue-50 text-[#4E61F6] text-[10px] sm:text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wider">
                        {plan.category}
                    </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{plan.name}</h2>

                        {userAge && userAge > 30 && plan.category === 'Indywidualny' && (
                            <p className="text-xs text-purple-600 mt-2 font-medium flex items-center gap-1">
                                ✨ Cena dopasowana do wieku ({userAge} lat)
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0 w-full md:w-auto justify-end mt-2 md:mt-0">
                        <div className="text-right">
                            <div className="flex flex-col items-end">
                                {billingPeriod === 'upfront' && hasDiscount && !isTestPeriod && (
                                    <span className="text-xs sm:text-sm text-red-400 line-through font-medium mb-1">
                                    {Math.round(upfrontOriginalTotal)} zł
                                </span>
                                )}

                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl sm:text-4xl font-black text-[#4E61F6]">
                                    {billingPeriod === 'monthly'
                                        ? displayMonthlyCardPrice
                                        : displayUpfrontCardPrice
                                    }
                                </span>
                                    <span className="text-base sm:text-lg text-gray-500 font-bold">
                                    {billingPeriod === 'monthly' ? 'zł / mies' : 'zł'}
                                </span>
                                </div>

                                <div className="flex flex-col items-end mt-1 gap-1">
                                    {!isTestPeriod && (
                                        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                                        Umowa na: <strong>{selectedOptionData?.label}</strong>
                                    </span>
                                    )}

                                    {billingPeriod === 'upfront' && hasDiscount && (
                                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
                                        Oszczędzasz {priceDetails.discountLabel}
                                    </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {user && (
                            <FavoriteButton packageId={plan.id} className="bg-white border border-gray-200 shadow-sm p-2 sm:p-3 hover:bg-red-50 text-gray-400 hover:text-red-50 transition-colors rounded-full" />
                        )}
                    </div>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-4 sm:p-6 mb-8 border border-blue-100">
                    <h4 className="text-blue-800 font-bold text-xs sm:text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Co zawiera pakiet?
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                        {featuresList.map((f, i) => (
                            <li key={i} className="flex items-start text-gray-700 text-sm">
                                <CheckIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="flex-1 leading-relaxed">{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mb-6">
                    <h4 className="font-bold text-gray-800 text-xs sm:text-sm mb-3 uppercase tracking-wide text-gray-500">
                        1. Wybierz okres trwania umowy
                    </h4>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => {
                                    onDurationChange(option.id);
                                    if(option.id === '7d') setBillingPeriod('upfront');
                                    else setBillingPeriod('monthly');
                                }}
                                className={`
                                flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center min-w-0 sm:min-w-[100px]
                                ${selectedDuration === option.id
                                    ? 'border-[#4E61F6] bg-blue-50 text-[#4E61F6] shadow-sm ring-1 ring-[#4E61F6] z-10'
                                    : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50'
                                }
                                ${option.months === 0 ? 'border-dashed border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : ''}
                            `}
                            >
                                <span className="font-bold text-sm sm:text-base whitespace-nowrap">{option.label}</span>
                                {option.months > 0 && <span className="text-[10px] opacity-70">kontrakt</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {!isTestPeriod && (
                    <div className="mb-6 bg-gray-50/80 p-4 sm:p-5 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-xs sm:text-sm mb-3 uppercase tracking-wide text-gray-500">
                            2. Wybierz sposób rozliczenia
                        </h4>

                        <div className="space-y-3">
                            <div
                                onClick={() => setBillingPeriod('monthly')}
                                className={`
                            group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg border cursor-pointer transition-all relative overflow-hidden select-none
                            ${billingPeriod === 'monthly'
                                    ? 'border-[#4E61F6] bg-white shadow-md'
                                    : 'border-gray-200 bg-white hover:border-blue-300'
                                }
                        `}>
                                <div className="flex items-center gap-3 sm:gap-4 relative z-10 w-full sm:w-auto mb-2 sm:mb-0">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${billingPeriod === 'monthly' ? 'border-[#4E61F6]' : 'border-gray-300'}`}>
                                        {billingPeriod === 'monthly' && <div className="w-2.5 h-2.5 rounded-full bg-[#4E61F6]" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm sm:text-base">Płatność miesięczna</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Niska rata, większa elastyczność.</div>
                                    </div>
                                </div>
                                <div className="pl-8 sm:pl-0 sm:text-right relative z-10">
                                    <span className="font-bold text-gray-900 text-base sm:text-lg">{displayMonthlyCardPrice} zł</span>
                                    <span className="text-xs text-gray-500 inline sm:block ml-1 sm:ml-0">/ mies</span>

                                    <span className="text-[10px] text-gray-400 font-medium mt-1 block">
                                    Razem: {Math.round(upfrontOriginalTotal)} zł
                                </span>
                                </div>
                            </div>

                            <div
                                onClick={() => setBillingPeriod('upfront')}
                                className={`
                            group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg border cursor-pointer transition-all relative overflow-hidden select-none
                            ${billingPeriod === 'upfront'
                                    ? 'border-[#4E61F6] bg-white shadow-md'
                                    : 'border-gray-200 bg-white hover:border-blue-300'
                                }
                        `}>
                                <div className="flex items-center gap-3 sm:gap-4 relative z-10 w-full sm:w-auto mb-2 sm:mb-0">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${billingPeriod === 'upfront' ? 'border-[#4E61F6]' : 'border-gray-300'}`}>
                                        {billingPeriod === 'upfront' && <div className="w-2.5 h-2.5 rounded-full bg-[#4E61F6]" />}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-gray-800 text-sm sm:text-base">Płatność z góry</span>

                                            {hasDiscount && (
                                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200 whitespace-nowrap">
                                                -{currentDiscount * 100}%
                                            </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">Jedna płatność. Najniższa cena całkowita.</div>
                                    </div>
                                </div>
                                <div className="pl-8 sm:pl-0 sm:text-right relative z-10">
                                    <span className="font-bold text-gray-900 text-base sm:text-lg">{displayUpfrontCardPrice} zł</span>
                                    <span className="text-xs text-gray-500 inline sm:block ml-1 sm:ml-0">jednorazowo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-start gap-3 bg-green-50 p-3 sm:p-4 rounded-xl mb-8 text-sm text-green-800 border border-green-100">
                    <div className="min-w-[20px] pt-0.5 text-xl"><ShieldCheckIcon className={"w-5 h-5"}/></div>
                    <div>
                        <strong className="block mb-1 text-green-900 text-sm">Pełna transparentność i bezpieczeństwo</strong>
                        {billingPeriod === 'monthly' && !isTestPeriod ? (
                            <p className="opacity-90 leading-relaxed text-xs sm:text-sm">
                                Płacąc miesięcznie, zachowujesz pełną kontrolę.
                                Możesz <strong>zrezygnować z subskrypcji w dowolnym momencie</strong>
                                (obowiązuje 1-miesięczny okres wypowiedzenia). Brak ukrytych kar umownych.
                            </p>
                        ) : (
                            <p className="opacity-90 leading-relaxed text-xs sm:text-sm">
                                Gwarantujemy stałą cenę przez cały okres trwania umowy.
                                Brak ukrytych opłat i niespodziewanych podwyżek.
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-2">
                        <h4 className="font-bold text-gray-800 text-xs sm:text-sm mb-2">O pakiecie</h4>
                        <p className="text-gray-600 leading-relaxed text-sm">{plan.description}</p>
                    </div>
                    <div className="md:col-span-1 space-y-2">
                        <h4 className="font-bold text-gray-800 text-xs sm:text-sm mb-2">Dodatki</h4>
                        <div className="flex flex-wrap gap-2">
                            {plan.hasDentalCare && <div className="text-xs bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 rounded text-gray-600 font-medium border border-gray-200">🦷 Stomatologia</div>}
                            {plan.hasHospitalization && <div className="text-xs bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 rounded text-gray-600 font-medium border border-gray-200">🏥 Szpital</div>}
                            {plan.hasRehabilitation && <div className="text-xs bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 rounded text-gray-600 font-medium border border-gray-200">🤸 Rehabilitacja</div>}
                        </div>
                    </div>
                </div>

                <Button
                    variant="primary"
                    className="w-full py-3 sm:py-4 text-base sm:text-lg shadow-xl flex flex-col sm:flex-row justify-center sm:justify-between px-4 sm:px-8 items-center group transition-all hover:shadow-2xl hover:-translate-y-0.5 min-h-[60px]"
                    onClick={onProceedToCheckout}
                    disabled={isBuying}
                >
                <span className="font-medium tracking-wide mb-1 sm:mb-0">
                    {isBuying ? "Przetwarzanie..." : "Przejdź do podsumowania"}
                </span>
                    <div className="flex flex-row sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0 leading-none">
                    <span className="font-bold text-white text-lg sm:text-xl">
                        {billingPeriod === 'monthly' ? displayMonthlyCardPrice : displayUpfrontCardPrice} zł
                    </span>
                        <span className="text-[11px] text-blue-100 font-normal opacity-90 group-hover:opacity-100">
                         {billingPeriod === 'monthly' ? 'płatne dzisiaj' : 'płatne jednorazowo'}
                    </span>
                    </div>
                </Button>

                <p className="text-center text-xs text-gray-400 mt-4 mb-8">
                    Klikając przycisk, przejdziesz do wyboru metody płatności.
                </p>

                <div className="pt-6 border-t border-gray-100">
                    <ReviewsList packageId={plan.id} />
                </div>
            </div>
        </Modal>
    )
}