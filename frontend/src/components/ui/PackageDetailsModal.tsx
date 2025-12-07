import Modal from "../ui/Modal.tsx";
import Button from "../ui/Button.tsx";
import CheckIcon from "../icons/CheckIcon.tsx";
import FavoriteButton from "../ui/FavouriteButton.tsx";
import ReviewsList from "../ui/ReviewList.tsx";
import {DURATION_OPTIONS} from "../../constants/options.ts";
import {calculatePersonalizedPrice} from "../../utils/pricingHelpers.ts";
import {useAuth} from "../../hooks/useAuth.ts";
import type {PackageDetailsModalProps} from "../../types/ui.types.ts";

export default function PackageDetailsModal({isOpen, onClose, plan, userAge, selectedDuration, onDurationChange, onProceedToCheckout}: PackageDetailsModalProps) {
    const {user} = useAuth()

    const getPriceDetails = () => {
        if (!plan) return {monthly: 0, total: 0, base: 0, isDiscounted: false, months: 12}

        const personalizedBase = calculatePersonalizedPrice(plan.priceValue, plan.category, userAge || 30)
        const discountFactor = selectedDuration === '2y' ? 0.85 : 1.0

        const months = selectedDuration === '2y' ? 24 : 12

        const monthlyWithDuration = personalizedBase * discountFactor
        const totalCost = monthlyWithDuration * months

        return {
            base: personalizedBase,
            monthly: monthlyWithDuration,
            total: totalCost,
            months,
            isDiscounted: selectedDuration === '2y',
            discountLabel: '-15% ZA 2 LATA'
        }
    }

    const priceData = getPriceDetails()

    if (!plan) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl w-full mx-4">
            <div
                className="text-gray-800 relative bg-white rounded-xl shadow-xl max-h-[85vh] overflow-y-auto custom-scrollbar p-6 mt-4">

                <div
                    className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b border-gray-100 pb-6">
                    <div className="flex-grow">
                        <span
                            className="inline-block bg-blue-50 text-[#4E61F6] text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wider">
                            {plan.category}
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">{plan.name}</h2>
                    </div>

                    <div className="flex items-center gap-5 flex-shrink-0">
                        <div className="text-right">
                            <div className="flex flex-col items-end">
                                {userAge !== 0 && priceData.base > plan.priceValue && (
                                    <span
                                        className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded mb-1">
                                        Uwzględniono wiek ({userAge} lat)
                                    </span>
                                )}

                                {priceData.isDiscounted && (
                                    <span className="text-xs text-red-400 line-through font-medium mb-1">
                                        {priceData.base.toFixed(0)} zł
                                    </span>
                                )}
                                <div className="flex items-baseline gap-1">
                                    <span
                                        className="text-4xl font-black text-[#4E61F6]">{priceData.monthly.toFixed(0)}</span>
                                    <span className="text-lg text-gray-500 font-bold">zł / mies</span>
                                </div>

                                <div className="flex flex-col items-end mt-1 gap-1">
                                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        Całość: <strong>{Math.round(priceData.total)} zł</strong> ({priceData.months} msc)
                                    </span>
                                    {priceData.isDiscounted && (
                                        <span
                                            className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded uppercase tracking-wide">
                                            {priceData.discountLabel}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {user && (
                            <FavoriteButton packageId={plan.id}
                                            className="bg-white border border-gray-200 shadow-sm p-3 hover:bg-red-50 text-gray-400 hover:text-red-50 transition-colors rounded-full"/>
                        )}
                    </div>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-6 mb-8 border border-blue-100">
                    <h4 className="text-blue-800 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Co zawiera pakiet?
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                        {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start text-gray-700 text-sm">
                                <CheckIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"/>
                                <span className="flex-1 leading-relaxed">{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mb-8">
                    <h4 className="font-bold text-gray-800 text-sm mb-3">Wybierz okres umowy</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {DURATION_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onDurationChange(option.value)}
                                className={`
                                    relative py-3 px-2 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 overflow-hidden
                                    ${selectedDuration === option.value
                                    ? 'border-[#4E61F6] bg-blue-50 text-[#4E61F6] shadow-md ring-1 ring-[#4E61F6] z-10'
                                    : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50'
                                }
                                    ${option.test ? 'border-dashed border-yellow-400 bg-yellow-50 text-yellow-700' : ''}
                                `}
                            >
                                <span>{option.label}</span>
                                {option.discount > 0 && (
                                    <span
                                        className="text-[10px] bg-green-100 text-green-700 px-2 rounded-full font-bold">
                                        -{option.discount * 100}%
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-2">
                        <h4 className="font-bold text-gray-800 text-sm mb-2">O pakiecie</h4>
                        <p className="text-gray-600 leading-relaxed text-sm">{plan.description}</p>
                    </div>
                    <div className="md:col-span-1 space-y-2">
                        <h4 className="font-bold text-gray-800 text-sm mb-2">Dodatki</h4>
                        <div className="flex flex-wrap gap-2">
                            {plan.hasDentalCare && <div
                                className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-600 font-medium border border-gray-200">🦷
                                Stomatologia</div>}
                            {plan.hasHospitalization && <div
                                className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-600 font-medium border border-gray-200">🏥
                                Szpital</div>}
                            {plan.hasRehabilitation && <div
                                className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-600 font-medium border border-gray-200">🤸
                                Rehabilitacja</div>}
                        </div>
                    </div>
                </div>

                <Button variant="primary"
                        className="w-full py-4 text-lg shadow-xl flex justify-between px-8 items-center"
                        onClick={onProceedToCheckout}>
                    <span>Przejdź do kasy</span>
                    <div className="flex flex-col items-end leading-none">
                        <span className="font-bold text-white text-lg">
                            {Math.round(priceData.total)} zł
                        </span>
                        <span className="text-[10px] text-blue-100 font-normal opacity-80">płatne jednorazowo</span>
                    </div>
                </Button>

                <p className="text-center text-xs text-gray-400 mt-3 mb-8">
                    Klikając przycisk, zawierasz umowę na czas określony. <br/> Brak ukrytych opłat.
                </p>

                <div className="pt-6 border-t border-gray-100">
                    <ReviewsList packageId={plan.id}/>
                </div>
            </div>
        </Modal>
    )
}