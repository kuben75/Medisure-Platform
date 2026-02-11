import Button from "../../components/ui/Button.tsx";
import {useEffect, useState} from "react";
import Modal from "../../components/ui/modals/Modal.tsx";
import Rating from "../../components/ui/Rating.tsx";
import {useNavigate} from 'react-router-dom';
import type {IPricingPlan} from "../../types/pricing.types.ts";
import FavoriteButton from "../../components/ui/FavouriteButton.tsx";
import {useNotification} from "../../hooks/UseNotification.ts";
import {usePackagePurchase} from "../../hooks/usePackagePurchase.ts";
import FlashIcon from "../../components/icons/FlashIcon.tsx";
import {useComparison} from "../../hooks/useComparison.ts";
import ChevronRightIcon from "../../components/icons/ChevronRightIcon.tsx";
import {useAuth} from "../../hooks/useAuth.ts";
import ShieldCheckIcon from "../../components/icons/ShieldCheckIcon.tsx";
import CalendarIcon from "../../components/icons/CalendarIcon.tsx";

export default function HeroSection() {
    const {user} = useAuth();
    const {
        selectedPlan,
        openModal,
        closeModal,
    } = usePackagePurchase();

    const [plans, setPlans] = useState<IPricingPlan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const {notify} = useNotification();
    const {addToComparison} = useComparison();

    const API_URL = `${import.meta.env.VITE_API_URL}/packages`;

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error("Błąd sieci");
                }

                const data: IPricingPlan[] = await response.json();
                const featuredPlans = data.filter((p) => p.isFeatured).slice(0, 3);

                if (featuredPlans.length === 0) {
                    setPlans(data.slice(0, 3));
                }
                else {
                    setPlans(featuredPlans);
                }

            } catch (e) {
                notify.error("Nie udało się pobrać ofert.");
                setError(`Nie udało się pobrać ofert.`);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const handleProceedToCalculator = () => {
        if (!selectedPlan) {
            return;
        }
        const targetId = selectedPlan.id;
        closeModal();
        navigate('/kalkulator', {state: {highlightPackageId: targetId}});
    };

    const handleCompareAndRedirect = () => {
        if (selectedPlan) {
            const targetId = selectedPlan.id;
            addToComparison(selectedPlan);
            closeModal();
            navigate('/kalkulator', {state: {highlightPackageId: targetId}});
        }
    };

    return (
        <section
            className="relative w-full text-center text-white py-24 md:py-32 px-4 bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#4338ca] overflow-hidden">

            <div
                className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl opacity-20 pointer-events-none animate-pulse"></div>
            <div
                className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">

                <h1 className="text-4xl md:text-6xl font-black mb-4 md:mb-6 leading-tight tracking-tight drop-shadow-lg">
                    Twoje Zdrowie, <br className="hidden md:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
                    Nasz Priorytet.
                </span>
                </h1>

                <p className="text-base md:text-xl text-blue-50 max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed opacity-90 px-2">
                    Wybierz pakiet medyczny dopasowany do Twojego stylu życia.
                    Płać wygodnie co miesiąc i zrezygnuj kiedy chcesz, lub oszczędzaj płacąc za rok z góry.
                </p>

                {loading && (
                    <div className="flex justify-center p-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
                        {plans.map((plan, index) => {
                            const featuresList = typeof plan.features === 'string'
                                ? plan.features.split(';')
                                : (Array.isArray(plan.features) ? plan.features : []);

                            return (
                                <div
                                    key={plan.id}
                                    className={`
                        relative flex flex-col bg-white text-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-500
                        transform hover:-translate-y-2 group
                        ${index === 1
                                        ? 'mt-4 mb-4 md:-mt-8 md:mb-8 border-4 border-yellow-400 z-10 shadow-blue-900/40 order-first md:order-none'
                                        : 'border border-transparent hover:shadow-xl opacity-95 hover:opacity-100'
                                    }`}
                                >
                                    {index === 1 && (
                                        <div
                                            className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1 w-max">
                                            <ShieldCheckIcon className="w-3 h-3 md:w-4 md:h-4"/> Najczęściej wybierany
                                        </div>
                                    )}

                                    {user && (
                                        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                                            <FavoriteButton packageId={plan.id}
                                                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors p-2 rounded-full"/>
                                        </div>
                                    )}

                                    <div className="mt-2 mb-2 md:mb-4 text-left">
                                        <p className="text-[10px] md:text-xs font-bold text-[#4E61F6] uppercase tracking-wider mb-1">{plan.category}</p>
                                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-[#4E61F6] transition-colors">{plan.name}</h3>
                                    </div>

                                    <div className="my-2 md:my-4 flex items-baseline gap-1 text-left">
                                        <span className="text-base md:text-lg text-gray-400 font-medium">od</span>
                                        <span
                                            className="text-4xl md:text-5xl font-extrabold text-gray-900"> {plan.price}</span>
                                        <div className="flex flex-col ml-1">
                                            <span
                                                className="text-xs md:text-sm font-bold text-gray-500">zł / mies</span>
                                        </div>
                                    </div>

                                    <div className="text-left mb-4 md:mb-6">
                        <span
                            className="inline-block bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded border border-green-100">
                            Możliwość płatności miesięcznej
                        </span>
                                    </div>

                                    <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-left flex-grow">
                                        {featuresList.slice(0, 4).map((feature, i) => (
                                            <li key={i} className="flex items-start text-xs md:text-sm text-gray-600">
                                                <div className="mt-0.5 min-w-[20px] text-green-500"><FlashIcon
                                                    className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 mr-2"/></div>
                                                <span className="ml-1 md:ml-2 leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mb-4 md:mb-6 flex justify-start">
                                        <Rating rating={plan.averageRating} reviews={plan.reviews}/>
                                    </div>

                                    <Button
                                        variant={index === 1 ? 'primary' : 'secondary'}
                                        className={`w-full py-3 md:py-4 text-sm font-bold shadow-lg hover:shadow-xl transition-all ${index !== 1 ? 'bg-gray-50 border-gray-200 hover:bg-white hover:border-[#4E61F6] text-gray-600 hover:text-[#4E61F6]' : ''}`}
                                        onClick={() => openModal(plan)}
                                    >
                                        Zobacz szczegóły
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-12 md:mt-20 animate-fade-in-up pb-8 md:pb-0">
                    <p className="text-blue-100 text-xs md:text-sm mb-4 uppercase tracking-wide font-semibold opacity-80">Nie
                        wiesz co wybrać?</p>
                    <Button variant="secondary"
                            className="w-full md:w-auto px-8 md:px-12 py-3 md:py-4 text-base md:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-transform bg-white text-[#4E61F6] border-none"
                            onClick={() => navigate('/kalkulator')}>
                        Przejdź do pełnego kalkulatora
                    </Button>
                </div>
            </div>

            <Modal isOpen={selectedPlan !== null} onClose={closeModal}
                   className="w-[95%] md:w-full max-w-lg bg-white overflow-hidden p-0 rounded-2xl md:rounded-3xl mx-auto my-auto">
                {selectedPlan && (
                    <div className="text-gray-800 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div
                            className="h-32 md:h-40 bg-gradient-to-br from-[#4E61F6] to-[#4338ca] flex flex-col items-center justify-center relative p-4 md:p-6 text-center shrink-0">
                        <span
                            className="inline-block bg-white/20 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] text-white font-bold uppercase tracking-wider mb-2 border border-white/10">
                            Wybrany Pakiet
                        </span>
                            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-1">{selectedPlan.name}</h2>
                            <p className="text-blue-100 text-xs md:text-sm opacity-90">{selectedPlan.category}</p>

                            <div className="absolute top-3 right-3 md:top-4 md:right-4">
                                <FavoriteButton packageId={selectedPlan.id}
                                                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-all"/>
                            </div>
                        </div>

                        <div className="p-5 md:p-8 -mt-6">
                            <div
                                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6 text-center mb-6 md:mb-8 relative z-10">
                                <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase mb-2">Cena
                                    podstawowa</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span
                                        className="text-4xl md:text-5xl font-black text-[#4E61F6]">{selectedPlan.price}</span>
                                    <span className="text-sm md:text-xl text-gray-500 font-bold">zł / mies</span>
                                </div>
                                <div className="mt-4 flex justify-center gap-2 flex-wrap">
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] md:text-xs font-bold rounded-md">
                                    <CalendarIcon className="w-3 h-3"/> Miesięcznie
                                </span>
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-[10px] md:text-xs font-bold rounded-md">
                                    <ShieldCheckIcon className="w-3 h-3"/> Rocznie (-5%)
                                </span>
                                </div>
                            </div>

                            <div className="space-y-5 md:space-y-6">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-xs md:text-sm uppercase tracking-wide mb-2 md:mb-3">Co
                                        zyskujesz?</h4>
                                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                                        {selectedPlan.description}
                                    </p>
                                </div>

                                <div className="bg-blue-50/50 p-3 md:p-4 rounded-xl border border-blue-100">
                                    <h4 className="font-bold text-blue-800 text-[10px] md:text-xs uppercase mb-2 md:mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        Elastyczność
                                    </h4>
                                    <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-700">
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Możliwość płatności co miesiąc
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Rezygnacja w dowolnym momencie*
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Szybka e-polisa na maila
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-3 pt-2 pb-4">
                                    <Button
                                        variant="primary"
                                        className="w-full py-3 md:py-4 text-base md:text-lg shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 group transition-all"
                                        onClick={handleProceedToCalculator}
                                    >
                                        Wybierz pakiet
                                        <ChevronRightIcon
                                            className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform"/>
                                    </Button>

                                    <button
                                        onClick={handleCompareAndRedirect}
                                        className="w-full py-2 md:py-3 text-xs md:text-sm font-bold text-gray-500 hover:text-[#4E61F6] flex items-center justify-center gap-2 transition-colors"
                                    >
                                        + Dodaj do porównania
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            className="bg-gray-50 p-3 text-center text-[9px] md:text-[10px] text-gray-400 border-t border-gray-100">
                            *Dotyczy subskrypcji miesięcznej z 30-dniowym okresem wypowiedzenia.
                        </div>
                    </div>
                )}
            </Modal>
        </section>
    )
}