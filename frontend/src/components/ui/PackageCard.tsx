import { Link } from 'react-router-dom';
import Button from './Button.tsx';
import Rating from './Rating.tsx';
import FavoriteButton from './FavouriteButton.tsx';
import { SPECIALISTS_LIST } from '../../constants/specialists.tsx';
import SparklesIcon from "../icons/SparklesIcon.tsx";
import BestMatchIcon from "../icons/BestMatchIcon.tsx";
import type {IPackageCardProps} from "../../types/ui.types.ts";

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

    const realSpecialistsCount = SPECIALISTS_LIST.filter(s =>
        s.availableInPackages.includes(pkg.name)
    ).length;
    const isBusiness = pkg.category === 'Biznesowy';

    let cardClasses = "group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col md:flex-row overflow-hidden relative";
    if (isHighlighted) cardClasses += " border-[#4E61F6] ring-4 ring-[#4E61F6]/20 z-10 scale-[1.02]";
    else if (isBestMatch) cardClasses += " border-indigo-200 ring-1 ring-indigo-50";
    else cardClasses += " border-gray-100";

    return (
        <div id={`package-card-${pkg.id}`} className={cardClasses}>
            {isBestMatch && !isHighlighted && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center shadow-md animate-fade-in">
                    <BestMatchIcon /> IDEALNY DLA CIEBIE
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
                    <span onClick={onOpenSpecs} className="inline-flex items-center bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors" title="Kliknij, aby zobaczyć listę">
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
                            {!showPersonalizedPricing && <span className="text-xs text-gray-500 font-medium mb-0.5">Cena od:</span>}

                            <div className="flex items-baseline justify-end gap-1">
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
    );
}