import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import type {ICalculationResultsProps} from "../../types/pricing.types.ts";
import FavoriteButton from "../../components/ui/FavouriteButton.tsx";
import UserIcon from "../../components/icons/UserIcon.tsx";
import CalendarIcon from "../../components/icons/CalendarIcon.tsx";
import ShieldIcon from "../../components/icons/ShieldIcon.tsx";
import CheckIcon from "../../components/icons/CheckIcon.tsx";

export default function CalculationResults({ estimatedPrice, packageType, age, recommendedPlan, onShowDetails }: ICalculationResultsProps) {
    const isContactRequired = packageType === 'company' || packageType === 'family_custom';

    const policyLabel = packageType === 'company' ? 'Biznesowa' :
        packageType === 'family_custom' ? 'Rodzinna (Duża)' :
            packageType === 'family' ? 'Rodzinna' : 'Indywidualna';

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-gray-200" id="results">
            <div className="max-w-6xl mx-auto">

                <div className="text-center mb-16">
                    <span className="text-blue-600 font-bold tracking-widest uppercase text-xs bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                        Wynik Analizy
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-6 mb-4">
                        Twoja oferta
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4 leading-relaxed">
                        {isContactRequired
                            ? "Twoje wymagania są specyficzne. Skontaktuj się z nami, aby nasi doradcy przygotowali ofertę uszytą na miarę."
                            : "Na podstawie Twoich danych dobraliśmy optymalne rozwiązanie, które łączy szeroki zakres usług z atrakcyjną ceną."
                        }
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                    <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-[#4E61F6]"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    {isContactRequired ? "Status Wyceny" : "Twoja składka"}
                                </h3>

                                {isContactRequired ? (
                                    <div>
                                        <div className="text-4xl font-extrabold text-[#4E61F6] tracking-tight leading-tight mb-2">
                                            Wycena <br/> Indywidualna
                                        </div>
                                        <div className="inline-block bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-lg border border-yellow-100">
                                            Do negocjacji
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-6xl font-extrabold text-[#4E61F6] tracking-tighter">{estimatedPrice}</span>
                                            <span className="text-2xl font-bold text-gray-400">zł</span>
                                        </div>
                                        <div className="mt-2 inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-lg">
                                            Płatność miesięczna
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="space-y-12 mb-8 flex-grow border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ShieldIcon className="w-6 h-6 text-gray-400"/>
                                        <span className="text-sm text-gray-600 font-medium">Typ polisy</span>
                                    </div>
                                    <span className="font-bold text-gray-800 capitalize bg-gray-50 px-2 py-1 rounded text-sm">
                                        {policyLabel}
                                    </span>
                                </div>

                                {!isContactRequired && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <UserIcon className="w-6 h-6 text-gray-400"/>
                                            <span className="text-sm text-gray-600 font-medium">Wiek</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{age} lat</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="w-6 h-6 text-gray-400"/>
                                        <span className="text-sm text-gray-600 font-medium">Okres</span>
                                    </div>
                                    <span className="font-bold text-gray-800">12 / 24 mies.</span>
                                </div>
                            </div>

                            {isContactRequired ? (
                                <Link to="/kontakt" className="w-full">
                                    <Button variant="primary" className="w-full border-slate-300 hover:border-[#4E61F6]  py-3">
                                        Przejdź do kontaktu
                                    </Button>
                                </Link>
                            ) : (
                                <p className="text-center text-xs text-gray-400 leading-relaxed px-4">
                                    Cena jest orientacyjna i zawiera podatek VAT.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-7 relative group">
                        <div className="absolute inset-0 bg-[#4E61F6] rounded-3xl transform translate-y-2 translate-x-2 opacity-10 group-hover:translate-y-3 group-hover:translate-x-3 transition-transform duration-300 -z-10"></div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-1 shadow-2xl h-full flex flex-col">
                            <div className="bg-white/10 backdrop-blur-md h-full w-full rounded-[20px] p-8 md:p-10 flex flex-col relative overflow-hidden border border-white/10">

                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start mb-8 relative z-10 gap-4">
                                    <div>
                                        <span className="inline-flex items-center gap-1.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm mb-3">
                                            ★ Rekomendacja
                                        </span>
                                        <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                            {recommendedPlan ? recommendedPlan.name : (isContactRequired ? "Oferta Szyta na Miarę" : "Szukamy opcji...")}
                                        </h3>
                                    </div>

                                    {recommendedPlan && !isContactRequired && (
                                        <div className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors cursor-pointer backdrop-blur-sm border border-white/10">
                                            <FavoriteButton
                                                packageId={recommendedPlan.id}
                                                className="text-white hover:text-red-300"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow relative z-10">
                                    {recommendedPlan ? (
                                        <>
                                            <p className="text-blue-100 text-lg mb-8 leading-relaxed font-light border-l-4 border-yellow-400 pl-4">
                                                {recommendedPlan.description}
                                            </p>

                                            <div className="bg-black/10 rounded-2xl p-6 border border-white/5 backdrop-blur-sm mb-8">
                                                <p className="text-xs font-bold text-blue-200 uppercase mb-4 tracking-wide">Kluczowe korzyści:</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {recommendedPlan.features.slice(0, 6).map((feature, i) => (
                                                        <div key={i} className="flex items-start text-sm font-medium text-white gap-2">
                                                            <CheckIcon className="w-5 h-5 text-white" />
                                                            <span className="leading-snug">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col justify-center h-40 text-blue-100">
                                            <p className="text-lg font-medium mb-2">Dla większych grup przygotowujemy oferty specjalne.</p>
                                            <p className="opacity-80">Skorzystaj z pomocy naszego doradcy biznesowego.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-center sm:text-left">
                                        <p className="text-xs text-blue-200 font-bold uppercase tracking-wide">
                                            {isContactRequired ? "Wsparcie B2B/VIP" : "Gwarancja satysfakcji"}
                                        </p>
                                        <p className="text-sm text-white/80 mt-0.5">
                                            {isContactRequired ? "Odpowiedź w 24h" : "Bezpieczna transakcja"}
                                        </p>
                                    </div>

                                    {isContactRequired ? (
                                        <Link to="/kontakt" className="w-full sm:w-auto">
                                            <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 text-lg font-bold shadow-xl bg-white text-[#4E61F6] border-none hover:bg-blue-50">
                                                Poproś o wycenę
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            className="w-full sm:w-auto px-8 py-4 text-lg font-bold shadow-xl bg-white text-[#4E61F6] border-none hover:bg-blue-50 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                            onClick={() => recommendedPlan && onShowDetails(recommendedPlan)}
                                        >
                                            Wybierz ten pakiet
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                            </svg>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}