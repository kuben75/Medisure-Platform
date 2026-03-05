import {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import Button from '../../components/ui/Button';
import type {ICalculationResultsProps} from "../../types/pricing.types.ts";
import FavoriteButton from "../../components/ui/FavouriteButton.tsx";
import UserIcon from "../../components/icons/UserIcon.tsx";
import ShieldIcon from "../../components/icons/ShieldIcon.tsx";
import CheckIcon from "../../components/icons/CheckIcon.tsx";
import ChevronRightIcon from "../../components/icons/ChevronRightIcon.tsx";
import {useAuth} from "../../hooks/useAuth.ts";
import {SPECIALISTS_LIST} from "../../constants/specialists.tsx";
import SpecialistsListModal from "../../components/ui/modals/SpecialistsListModal.tsx";
import SparklesIcon from "../../components/icons/SparklesIcon.tsx";

export default function CalculationResults({
                                               estimatedPrice,
                                               packageType,
                                               age,
                                               recommendedPlan,
                                               onShowDetails,
                                               budgetExceeded
                                           }: ICalculationResultsProps & { budgetExceeded?: boolean }) {
    const isCompany = packageType === 'Biznesowy';
    const isFamilyCustom = packageType === 'family_custom';
    const isContactRequired = isCompany || isFamilyCustom;
    const {user} = useAuth();

    const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);

    const policyLabel = isCompany ? 'Biznesowy' :
        isFamilyCustom ? 'Rodzinna (Duża)' :
            packageType === 'Rodzinny' ? 'Rodzinna' : 'Indywidualna';

    const grossAmount = Math.round(estimatedPrice * 100) / 100;
    const netAmount = (grossAmount / 1.23).toFixed(2);
    const vatAmount = (grossAmount - parseFloat(netAmount)).toFixed(2);

    const priceRange = useMemo(() => {
        if (!recommendedPlan || isContactRequired) {
            return null;
        }
        const base = recommendedPlan.priceValue;
        if (recommendedPlan.category === 'Senior' || recommendedPlan.category === 'Biznesowy') {
            return null;
        }
        const min = Math.round(base);
        const max = Math.round(base * 1.9);
        return {min, max};
    }, [recommendedPlan, isContactRequired]);

    const specialistsCount = useMemo(() => {
        if (!recommendedPlan) {
            return 0;
        }

        return SPECIALISTS_LIST.filter(s => s.availableInPackages.includes(recommendedPlan.name)).length;
    }, [recommendedPlan]);

    const isPersonalized = estimatedPrice > (recommendedPlan?.priceValue || 0) && !isContactRequired;

    const featuresList = useMemo(() => {
        if (!recommendedPlan?.features) {
            return [];
        }

        if (typeof recommendedPlan.features === 'string') {
            return recommendedPlan.features.split(';').map(f => f.trim()).filter(Boolean);
        }


        return Array.isArray(recommendedPlan.features) ? recommendedPlan.features : [];
    }, [recommendedPlan]);

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-gray-200" id="results">
            <div className="max-w-6xl mx-auto">

                <div className="text-center mb-16">
                    <span
                        className="text-indigo-600 font-bold tracking-widest uppercase text-xs bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 shadow-sm">
                        Wynik Analizy
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-6 mb-4">
                        Twoja spersonalizowana oferta
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4 leading-relaxed">
                        {isContactRequired
                            ? "Na podstawie Twoich kryteriów przygotowaliśmy wstępną propozycję. Szczegóły wymagają doprecyzowania z naszym doradcą."
                            : "Na podstawie Twoich danych dobraliśmy optymalne rozwiązanie, które łączy szeroki zakres usług z atrakcyjną ceną."
                        }
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                    <div
                        className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 flex flex-col justify-between relative overflow-hidden group">
                        <div
                            className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-400 to-[#4E61F6]"></div>
                        <div
                            className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    {isFamilyCustom ? "Status Wyceny" : "Twój koszt miesięczny"}
                                </h3>

                                {budgetExceeded && !isContactRequired && (
                                    <div
                                        className="mb-4 bg-orange-50 border border-orange-100 rounded-xl p-4 text-xs text-orange-800 leading-relaxed shadow-sm">
                                        <div className="flex gap-2 items-start">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                 fill="currentColor"
                                                 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5">
                                                <path fillRule="evenodd"
                                                      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                            <span>
                                                <strong>Oferta poza budżetem.</strong> W Twoim zakresie cenowym nie znaleźliśmy pakietów. Poniżej przedstawiamy najtańszą dostępną opcję spełniającą kryteria wiekowe.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {isFamilyCustom ? (
                                    <div>
                                        <div
                                            className="text-3xl font-extrabold text-[#4E61F6] tracking-tight leading-tight mb-2">
                                            Oferta Dedykowana
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium">
                                            Dla dużych rodzin przygotowujemy pakiety "szyte na miarę". Skontaktuj się z
                                            nami, aby omówić szczegóły.
                                        </p>
                                    </div>
                                ) : isCompany ? (
                                    estimatedPrice > 0 ? (
                                        <>
                                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                                <span className="text-2xl text-gray-400 font-medium">Już od</span>
                                                <span
                                                    className="text-6xl font-extrabold tracking-tighter text-[#4E61F6]">
                                                    {estimatedPrice}
                                                </span>
                                                <span className="text-2xl font-bold text-gray-400">zł</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Cena netto za osobę przy min. 30
                                                pracownikach.</p>
                                        </>
                                    ) : (
                                        <div>
                                            <div
                                                className="text-3xl font-extrabold text-[#4E61F6] tracking-tight leading-tight mb-2">
                                                Wycena B2B
                                            </div>
                                            <p className="text-sm text-gray-500">Skontaktuj się w celu ustalenia zakresu
                                                usług dla firmy.</p>
                                        </div>
                                    )
                                ) : (
                                    <>
                                        <div className="flex items-baseline gap-1.5 flex-wrap">
                                            <span
                                                className={`text-6xl font-extrabold tracking-tighter ${isPersonalized ? 'text-purple-600' : 'text-[#4E61F6]'}`}>
                                                {estimatedPrice}
                                            </span>
                                            <span className="text-2xl font-bold text-gray-400">zł</span>
                                        </div>

                                        {isPersonalized && !budgetExceeded && (
                                            <div
                                                className="mt-3 inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-100">
                                                <SparklesIcon/>
                                                Oferta dopasowana do wieku ({age} lat)
                                            </div>
                                        )}
                                        {priceRange && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-xs text-gray-400 mb-1">Zakres cen dla tego pakietu
                                                    (wg wieku):</p>
                                                <p className="text-sm font-medium text-gray-600">
                                                    od <span className="font-bold">{priceRange.min} zł</span> do <span
                                                    className="font-bold">{priceRange.max} zł</span>
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {!isContactRequired && estimatedPrice > 0 && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 space-y-2">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Składka Netto</span>
                                        <span className="font-medium">{netAmount} zł</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>VAT (23%)</span>
                                        <span className="font-medium">{vatAmount} zł</span>
                                    </div>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <div className="flex justify-between text-sm font-bold text-gray-800">
                                        <span>Brutto (miesięcznie)</span>
                                        <span>{grossAmount.toFixed(2)} zł</span>
                                    </div>
                                </div>
                            )}

                            {isCompany && (
                                <div
                                    className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed">
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
                                            <span
                                                className="text-sm text-gray-600 font-medium">Wiek ubezpieczonego</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{age} lat</span>
                                    </div>
                                )}
                            </div>

                            {isContactRequired ? (
                                <Link to="/kontakt" className="w-full">
                                    <Button variant="secondary"
                                            className="w-full border-gray-300 hover:border-[#4E61F6] hover:text-[#4E61F6] py-3">
                                        Skontaktuj się z nami
                                    </Button>
                                </Link>
                            ) : (
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Wybierz pakiet po prawej stronie, aby przejść do podsumowania i płatności.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-7 relative group h-full">
                        <div
                            className="absolute inset-0 bg-[#4E61F6] rounded-[24px] transform translate-y-2 translate-x-2 opacity-10 group-hover:translate-y-3 group-hover:translate-x-3 transition-transform duration-300 -z-10"></div>

                        <div
                            className="bg-gradient-to-br from-[#4E61F6] to-indigo-900 rounded-[24px] p-1 shadow-2xl h-full flex flex-col">
                            <div
                                className="bg-white/10 backdrop-blur-md h-full w-full rounded-[20px] p-8 md:p-10 flex flex-col relative overflow-hidden border border-white/10">

                                <div
                                    className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>

                                <div className="flex flex-row justify-between items-start mb-8 relative z-10 gap-4">
                                    <div>
                                        <span
                                            className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg mb-3">
                                            {isContactRequired ? "★ Kontakt Wymagany" : "★ Rekomendacja"}
                                        </span>
                                        <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                            {recommendedPlan ? recommendedPlan.name : (isFamilyCustom ? "Oferta Indywidualna" : "Szukamy opcji...")}
                                        </h3>
                                    </div>

                                    {recommendedPlan && !isContactRequired && user && (
                                        <div
                                            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors cursor-pointer backdrop-blur-sm border border-white/10 shadow-lg">
                                            <FavoriteButton packageId={recommendedPlan.id}
                                                            className="text-white hover:text-red-300"/>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow relative z-10">
                                    {recommendedPlan ? (
                                        <>
                                            <p className="text-blue-50 text-lg mb-8 leading-relaxed font-light border-l-4 border-amber-400 pl-4">
                                                {recommendedPlan.description}
                                            </p>

                                            <div
                                                className="bg-black/20 rounded-2xl p-6 border border-white/5 backdrop-blur-sm mb-8">
                                                <div
                                                    className="flex flex-col gap-2 md:gap-0 md:flex-row justify-between items-center mb-4">
                                                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wide">Kluczowe
                                                        korzyści</p>

                                                    <button
                                                        onClick={() => setIsSpecsModalOpen(true)}
                                                        className="group/specs flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer border border-white/5"
                                                    >
                                                        <div className="bg-green-500/20 p-1 rounded-full">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                                 fill="currentColor"
                                                                 className="w-3.5 h-3.5 text-green-400">
                                                                <path fillRule="evenodd"
                                                                      d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                                                                      clipRule="evenodd"/>
                                                            </svg>
                                                        </div>
                                                        <span
                                                            className="text-xs font-medium text-white group-hover/specs:underline decoration-white/50 underline-offset-2">
                                                            {specialistsCount} Specjalistów
                                                        </span>
                                                    </button>

                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {featuresList.slice(0, 6).map((feature, i) => (
                                                        <div key={i}
                                                             className="flex items-start text-sm font-medium text-white group/item">
                                                            <div
                                                                className="mt-0.5 mr-3 p-0.5 bg-green-500/20 rounded-full group-hover/item:bg-green-500 transition-colors shrink-0">
                                                                <CheckIcon
                                                                    className="w-4 h-4 text-green-400 group-hover/item:text-white transition-colors"/>
                                                            </div>
                                                            <span
                                                                className="leading-snug opacity-90 group-hover/item:opacity-100">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col justify-center h-40 text-blue-100">
                                            <p className="text-lg font-medium mb-2">
                                                {isFamilyCustom
                                                    ? "Dla dużych rodzin (powyżej 5 osób) przygotowujemy ofertę dedykowaną."
                                                    : "Dla specyficznych wymagań przygotowujemy oferty specjalne."
                                                }
                                            </p>
                                            <p className="opacity-80">Nasi doradcy pomogą dobrać najlepsze
                                                rozwiązanie.</p>
                                        </div>
                                    )}
                                </div>

                                <div
                                    className="mt-auto pt-6 border-t border-white/10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-center sm:text-left">
                                        <p className="text-xs text-blue-200 font-bold uppercase tracking-wide">
                                            {isContactRequired ? "Wsparcie Doradcy" : "Gwarancja jakości"}
                                        </p>
                                        <p className="text-sm text-white/80 mt-0.5">
                                            {isContactRequired ? "Odpowiedź w 24h" : "Transakcja szyfrowana SSL"}
                                        </p>
                                    </div>

                                    {isContactRequired ? (
                                        <Link to="/kontakt" className="w-full sm:w-auto">
                                            <Button variant="secondary"
                                                    className="w-full sm:w-auto px-8 py-4 text-lg font-bold shadow-xl bg-white text-[#4E61F6] border-none hover:bg-blue-50">
                                                Poproś o wycenę
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            className="w-full sm:w-auto px-8 py-4 text-lg font-bold shadow-xl bg-white text-[#4E61F6] border-none hover:bg-blue-50 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                                            onClick={() => recommendedPlan && onShowDetails(recommendedPlan)}
                                        >
                                            Wybierz ten pakiet
                                            <ChevronRightIcon
                                                className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {recommendedPlan && (
                <SpecialistsListModal
                    isOpen={isSpecsModalOpen}
                    onClose={() => setIsSpecsModalOpen(false)}
                    packageName={recommendedPlan.name}
                    includedSpecializations={recommendedPlan.includedSpecializations || []}
                />
            )}
        </section>
    )
}