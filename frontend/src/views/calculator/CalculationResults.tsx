import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import type { ICalculationResultsProps } from "../../types/pricing.types.ts";
import FavoriteButton from "../../components/ui/FavouriteButton.tsx";
import UserIcon from "../../components/icons/UserIcon.tsx";
import CalendarIcon from "../../components/icons/CalendarIcon.tsx";
import ShieldIcon from "../../components/icons/ShieldIcon.tsx";
import CheckIcon from "../../components/icons/CheckIcon.tsx";
import ChevronRightIcon from "../../components/icons/ChevronRightIcon.tsx";
import { useAuth } from "../../hooks/useAuth.ts";

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
    </svg>
);

export default function CalculationResults({ estimatedPrice, packageType, age, recommendedPlan, onShowDetails }: ICalculationResultsProps) {
    const isCompany = packageType === 'company'
    const isFamilyCustom = packageType === 'family_custom'
    const isContactRequired = isCompany || isFamilyCustom
    const { user } = useAuth()

    const policyLabel = isCompany ? 'Biznesowa' :
        isFamilyCustom ? 'Rodzinna (Duża)' :
            packageType === 'family' ? 'Rodzinna' : 'Indywidualna';

    // Obliczanie zakresu cen (symulacja widełek rynkowych dla danego pakietu)
    const priceRange = useMemo(() => {
        if (!recommendedPlan || isContactRequired) return null;

        const base = recommendedPlan.priceValue;

        // Pakiety senior i biznes nie mają widełek wiekowych w ten sam sposób
        if (recommendedPlan.category === 'Senior' || recommendedPlan.category === 'Business') return null;

        // Symulacja: Min to cena bazowa, Max to cena dla osoby ~70 lat (ok. 1.8x - 2.0x)
        const min = Math.round(base);
        const max = Math.round(base * 1.9);

        return { min, max };
    }, [recommendedPlan, isContactRequired]);

    const isPersonalized = estimatedPrice > (recommendedPlan?.priceValue || 0) && !isContactRequired;

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-gray-200" id="results">
            <div className="max-w-6xl mx-auto">

                <div className="text-center mb-16">
                    <span className="text-indigo-600 font-bold tracking-widest uppercase text-xs bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                        Wynik Analizy
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-6 mb-4">
                        Twoja spersonalizowana oferta
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4 leading-relaxed">
                        {isContactRequired
                            ? "Przygotowaliśmy wstępną propozycję. Szczegóły wymagają doprecyzowania z naszym doradcą."
                            : "Na podstawie Twoich danych dobraliśmy optymalne rozwiązanie, które łączy szeroki zakres usług z atrakcyjną ceną."
                        }
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                    {/* LEWA STRONA - PODSUMOWANIE CENY */}
                    <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-400 to-[#4E61F6]"></div>

                        {/* Tło dekoracyjne */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    {isFamilyCustom ? "Status Wyceny" : "Twój koszt miesięczny"}
                                </h3>

                                {isFamilyCustom ? (
                                    <div>
                                        <div className="text-4xl font-extrabold text-[#4E61F6] tracking-tight leading-tight mb-2">
                                            Wycena <br/> Indywidualna
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-baseline gap-1.5 flex-wrap">
                                            {isCompany && <span className="text-2xl text-gray-400 font-medium">Już od</span>}

                                            <span className={`text-6xl font-extrabold tracking-tighter ${isPersonalized ? 'text-purple-600' : 'text-[#4E61F6]'}`}>
                                                {estimatedPrice}
                                            </span>
                                            <span className="text-2xl font-bold text-gray-400">zł</span>
                                        </div>

                                        {/* BADGE PERSONALIZACJI */}
                                        {isPersonalized && (
                                            <div className="mt-3 inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-100">
                                                <SparklesIcon />
                                                Oferta dopasowana do wieku ({age} lat)
                                            </div>
                                        )}

                                        {/* WIDEŁKI CENOWE */}
                                        {priceRange && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-xs text-gray-400 mb-1">Zakres cen dla tego pakietu (wg wieku):</p>
                                                <p className="text-sm font-medium text-gray-600">
                                                    od <span className="font-bold">{priceRange.min} zł</span> do <span className="font-bold">{priceRange.max} zł</span>
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {isCompany && (
                                <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-xs text-yellow-800 leading-relaxed">
                                    <strong>Uwaga:</strong> Ostateczna wycena jest zależna od liczby pracowników,
                                    środowiska pracy oraz zakresu medycyny pracy.
                                </div>
                            )}

                            <div className="space-y-6 mb-8 flex-grow">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <ShieldIcon className="w-5 h-5 text-indigo-500"/>
                                        <span className="text-sm text-gray-600 font-medium">Rodzaj polisy</span>
                                    </div>
                                    <span className="font-bold text-gray-800 capitalize text-sm">
                                        {policyLabel}
                                    </span>
                                </div>

                                {!isContactRequired && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <UserIcon className="w-5 h-5 text-indigo-500"/>
                                            <span className="text-sm text-gray-600 font-medium">Wiek ubezpieczonego</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{age} lat</span>
                                    </div>
                                )}

                                {!isFamilyCustom && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <CalendarIcon className="w-5 h-5 text-indigo-500"/>
                                            <span className="text-sm text-gray-600 font-medium">Okres umowy</span>
                                        </div>
                                        <span className="font-bold text-gray-800">12 / 24 mies.</span>
                                    </div>
                                )}
                            </div>

                            {isContactRequired ? (
                                <Link to="/kontakt" className="w-full">
                                    <Button variant="secondary" className="w-full border-slate-300 hover:border-[#4E61F6] py-3">
                                        Skontaktuj się z nami
                                    </Button>
                                </Link>
                            ) : (
                                <p className="text-center text-[10px] text-gray-400 leading-relaxed px-4">
                                    Podana kwota jest ceną brutto (zawiera VAT). Wybierz pakiet obok, aby sfinalizować zakup.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* PRAWA STRONA - KARTA PAKIETU */}
                    <div className="lg:col-span-7 relative group">
                        <div className="absolute inset-0 bg-[#4E61F6] rounded-3xl transform translate-y-2 translate-x-2 opacity-10 group-hover:translate-y-3 group-hover:translate-x-3 transition-transform duration-300 -z-10"></div>

                        <div className="bg-gradient-to-br from-[#4E61F6] to-indigo-900 rounded-3xl p-1 shadow-2xl h-full flex flex-col">
                            <div className="bg-white/10 backdrop-blur-lg h-full w-full rounded-[20px] p-8 md:p-10 flex flex-col relative overflow-hidden border border-white/10">

                                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start mb-8 relative z-10 gap-4">
                                    <div>
                                        <span className="inline-flex items-center gap-1.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm mb-3">
                                            ★ Najlepsze dopasowanie
                                        </span>
                                        <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                            {recommendedPlan ? recommendedPlan.name : (isContactRequired ? "Oferta Indywidualna" : "Szukamy opcji...")}
                                        </h3>
                                    </div>

                                    {recommendedPlan && !isContactRequired && user && (
                                        <div className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors cursor-pointer backdrop-blur-sm border border-white/10">
                                            <FavoriteButton packageId={recommendedPlan.id} className="text-white hover:text-red-300" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow relative z-10">
                                    {recommendedPlan ? (
                                        <>
                                            <p className="text-blue-50 text-lg mb-8 leading-relaxed font-light border-l-4 border-yellow-400 pl-4">
                                                {recommendedPlan.description}
                                            </p>

                                            <div className="bg-black/20 rounded-2xl p-6 border border-white/5 backdrop-blur-sm mb-8">
                                                <p className="text-xs font-bold text-blue-200 uppercase mb-4 tracking-wide">Dlaczego ten pakiet?</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {recommendedPlan.features.slice(0, 6).map((feature, i) => (
                                                        <div key={i} className="flex items-start text-sm font-medium text-white group/item">
                                                            <div className="mt-0.5 mr-3 p-0.5 bg-green-500/20 rounded-full group-hover/item:bg-green-500 transition-colors">
                                                                <CheckIcon className="w-4 h-4 text-green-400 group-hover/item:text-white transition-colors"/>
                                                            </div>
                                                            <span className="leading-snug opacity-90 group-hover/item:opacity-100">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col justify-center h-40 text-blue-100">
                                            <p className="text-lg font-medium mb-2">Dla specyficznych wymagań przygotowujemy oferty specjalne.</p>
                                            <p className="opacity-80">Nasi doradcy pomogą dobrać zakres usług.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-center sm:text-left">
                                        <p className="text-xs text-blue-200 font-bold uppercase tracking-wide">
                                            {isContactRequired ? "Wsparcie Doradcy" : "Gwarancja jakości"}
                                        </p>
                                        <p className="text-sm text-white/80 mt-0.5">
                                            {isContactRequired ? "Odpowiedź w 24h" : "Bezpieczna płatność SSL"}
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
                                            <ChevronRightIcon className="w-5 h-5"/>
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