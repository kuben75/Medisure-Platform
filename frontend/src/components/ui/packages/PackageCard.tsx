import { Link } from 'react-router-dom';
import Button from '../Button.tsx';
import Rating from '../Rating.tsx';
import FavoriteButton from '../FavouriteButton.tsx';
import { SPECIALISTS_LIST } from '../../../constants/specialists.tsx';
import SparklesIcon from "../../icons/SparklesIcon.tsx";
import BestMatchIcon from "../../icons/BestMatchIcon.tsx";
import type {IPackageCardProps} from "../../../types/ui.types.ts";
import {useAuth} from "../../../hooks/useAuth.ts";
import {useMemo} from "react";

const DoctorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.125a7.125 7.125 0 011.416 4.902.75.75 0 01-1.052.667 13.075 13.075 0 01-6.761-1.873c.091-.037.18-.076.268-.117a8.624 8.624 0 005.88-3.579z" />
    </svg>
)

const ToothIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M19.7999 5.2C19.1999 3.3 17.3999 2 15.2999 2C13.7999 2 12.4999 2.7 11.7999 3.7C11.0999 2.7 9.79991 2 8.29991 2C6.19991 2 4.39991 3.3 3.79991 5.2C2.29991 9.7 2.99991 16.7 6.29991 20.7C6.59991 21.1 7.19991 21.2 7.69991 20.8L10.7999 18.5C11.3999 18 12.2999 18 12.8999 18.5L15.9999 20.8C16.4999 21.2 17.0999 21 17.3999 20.7C20.6999 16.7 21.3999 9.7 19.7999 5.2Z"/>
    </svg>
)
const ClinicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.58.652l3.109-.732a.75.75 0 01.917.81 47.784 47.784 0 00.005 10.337.75.75 0 01-.574.812l-3.114.733a9.75 9.75 0 01-6.594-.158l-.108-.054a8.25 8.25 0 00-5.69-.625l-2.202.55V21a.75.75 0 01-1.5 0V3A.75.75 0 013 2.25z" clipRule="evenodd" />
    </svg>
);
const HospitalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 01.75.75v2.25h13.5V3a.75.75 0 011.5 0v2.25h1.5a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75h1.5V3a.75.75 0 01.75-.75zm14.25 4.5H5.25v13.5h13.5V6.75zm-9 3.75a.75.75 0 01.75.75v2.25h2.25a.75.75 0 010 1.5h-2.25v2.25a.75.75 0 01-1.5 0v-2.25H7.5a.75.75 0 010-1.5h2.25v-2.25a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
)
export default function PackageCard({
                                        pkg,
                                        isHighlighted,
                                        isBestMatch,
                                        displayPrice,
                                        isPriceIncreased,
                                        showPersonalizedPricing,
                                        showYearlyPrice,
                                        isInComparison,
                                        onToggleComparison,
                                        onOpenSpecs,
                                        onOpenDetails
                                    }: IPackageCardProps) {
    const { user } = useAuth()
    const realSpecialistsCount = useMemo(() => {
        if (!pkg.includedSpecializations) return 0
        const allowedCategories = pkg.includedSpecializations.split(';').map(c => c.trim())
        return SPECIALISTS_LIST.filter(s => allowedCategories.includes(s.category)).length
    }, [pkg.includedSpecializations])
    const isBusiness = pkg.category === 'Biznesowy'

    let cardClasses = "group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col md:flex-row overflow-hidden relative";
    if (isHighlighted) cardClasses += " border-[#4E61F6] ring-4 ring-[#4E61F6]/20 z-10 scale-[1.02]";
    else if (isBestMatch) cardClasses += " border-indigo-200 ring-1 ring-indigo-50";
    else cardClasses += " border-gray-100"

    return (
        <div id={`package-card-${pkg.id}`} className={cardClasses}>
            {isBestMatch && !isHighlighted && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center shadow-md animate-fade-in">
                    <BestMatchIcon /> IDEALNY DLA CIEBIE
                </div>
            )}

            {pkg.isFeatured && !isBestMatch && !isHighlighted && (
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1.5 bg-[#4E61F6]"></div>
            )}

            <div className="flex-grow p-5 sm:p-6 lg:p-8 lg:pl-8 relative">
                <div className="flex flex-col items-start mb-4 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        {pkg.isFeatured && (
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                Polecany
                            </span>
                        )}
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{pkg.category}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-[#4E61F6] transition-colors mt-1">
                        {pkg.name}
                    </h3>

                    <div className="mt-2">
                        <Rating rating={pkg.averageRating} reviews={pkg.reviews} className="flex items-center gap-1 !mt-0 !mb-0" />
                    </div>
                </div>

                <p className="text-gray-600 mb-5 pb-4 border-b border-gray-50 text-sm line-clamp-3 sm:line-clamp-2">
                    {pkg.description}
                </p>

                <div className="flex flex-wrap gap-2">

                    <span onClick={onOpenSpecs} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors" title="Kliknij, aby zobaczyć listę">
                        <DoctorIcon /> {realSpecialistsCount} Specjalistów
                    </span>

                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-100">
                        <ClinicIcon /> {pkg.facilitiesCount} Placówek
                    </span>

                    {pkg.hasDentalCare && (
                        <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-teal-100">
                            <ToothIcon /> Stomatolog
                        </span>
                    )}

                    {pkg.hasHospitalization && (
                        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-100">
                            <HospitalIcon /> Szpital
                        </span>
                    )}
                </div>
            </div>

            <div className="w-full lg:w-72 bg-gray-50/50 lg:bg-gray-50/30 border-t lg:border-t-0 lg:border-l border-gray-100 p-5 sm:p-6 flex flex-col justify-between gap-6">
                <div className="flex flex-row justify-between items-start gap-4">
                    <div className="text-left lg:text-right flex-grow order-1 lg:order-1">
                        <div className="flex flex-col items-start lg:items-end">
                            {showPersonalizedPricing && isPriceIncreased && (
                                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-purple-600 font-semibold mb-1 bg-purple-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    <SparklesIcon /> <span className="hidden sm:inline">Cena indywidualna</span><span className="sm:hidden">Indywidualna</span>
                                </div>
                            )}
                            {!showPersonalizedPricing && <span className="text-xs text-gray-500 font-medium mb-0.5">Cena od:</span>}

                            <div className="flex items-baseline justify-start lg:justify-end gap-1">
                                <span className={`text-3xl font-extrabold ${showPersonalizedPricing && isPriceIncreased ? 'text-purple-600' : 'text-[#4E61F6]'}`}>
                                    {displayPrice}
                                </span>
                                <span className="text-2xl text-gray-400 font-bold ">zł</span>
                            </div>

                            {isBusiness ? (
                                <div className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wide">Cena netto / osoba</div>
                            ) : (
                                <span className="text-xs text-gray-400 font-medium">{`/ ${showYearlyPrice ? 'rok' : 'mc'}`}</span>
                            )}
                        </div>
                    </div>

                    <div className="order-2 lg:order-2 ml-0 lg:ml-3 flex lg:justify-end">
                        {user && (
                            <FavoriteButton packageId={pkg.id} className="bg-white shadow-sm hover:bg-red-50" />
                        )}
                    </div>
                </div>

                <div className="space-y-3 mt-0 lg:mt-auto pt-4 lg:pt-0 border-t border-gray-200 lg:border-0">
                    {isBusiness ? (
                        <Link to="/kontakt" className="w-full block">
                            <Button variant="secondary" className="w-full !py-2.5 text-sm shadow-md border-blue-200 text-blue-700 hover:bg-blue-50">
                                Poproś o ofertę
                            </Button>
                        </Link>
                    ) : (
                        <Button variant="primary" className="w-full !py-2.5 text-sm shadow-md" onClick={onOpenDetails}>
                            Szczegóły oferty
                        </Button>
                    )}

                    {!isBusiness && (
                        <label className={`flex items-center justify-center cursor-pointer w-full py-2 rounded-lg border transition-all ${isInComparison ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                            <input type="checkbox" className="hidden" checked={isInComparison} onChange={onToggleComparison} />
                            <span className="text-xs font-bold uppercase tracking-wide">{isInComparison ? "Wybrano" : "+ Porównaj"}</span>
                        </label>
                    )}
                </div>
            </div>
        </div>
    )
}