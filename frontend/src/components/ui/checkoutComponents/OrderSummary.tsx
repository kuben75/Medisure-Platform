import CheckIcon from '../../icons/CheckIcon.tsx';
import CalendarIcon from '../../icons/CalendarIcon.tsx';
import ShieldCheckIcon from '../../icons/ShieldCheckIcon.tsx';
import InfoIcon from '../../icons/InfoIcon.tsx';
import LockIcon from '../../icons/LockIcon.tsx';
import type {IOrderSummaryProps} from "../../../types/pricing.types.ts";

export default function OrderSummary({plan, billingPeriod, durationMonths,
                                         effectiveStart, effectiveEnd, priceIncrease,
                                         dynamicNetto, dynamicVat, dynamicTotalContractValue,
                                         safeAmountToPay, savingsAmount, hasSavings, onClose
                                     }: IOrderSummaryProps) {
    const featuresList = typeof plan.features === 'string'
        ? plan.features.split(';').map(f => f.trim()).filter(Boolean)
        : (Array.isArray(plan.features) ? plan.features : [])

    const formatDate = (date: Date) => date.toLocaleDateString('pl-PL', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    })

    return (
        <div className="w-full lg:w-5/12 xl:w-4/12 bg-[#0F172A] text-white flex flex-col relative flex-shrink-0 lg:h-full lg:overflow-hidden order-first shadow-2xl z-20">
            <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-500/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none -ml-20 -mb-20"></div>

            <div className="relative z-10 pt-6 px-5 md:pt-10 md:px-10 pb-2 flex-shrink-0">
                <button onClick={onClose} className="group flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                    <span className="text-xl leading-none group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Powrót</span>
                </button>
            </div>

            <div className="relative z-10 flex-grow lg:overflow-y-auto custom-scrollbar px-5 py-4 md:px-10">
                <div className="mb-6">
                    <div className="mb-4 flex flex-wrap gap-2">
                        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-white/5">
                            Twoje zamówienie
                        </span>
                        {hasSavings && (
                            <span className="inline-block px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-green-400 border border-green-500/30">
                                Oszczędzasz {savingsAmount} zł
                            </span>
                        )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white">{plan.name}</h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">{plan.description}</p>

                    <div className="space-y-2 mb-6">
                        {featuresList.map((f, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-slate-300 group">
                                <div className="mt-0.5 p-1 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors flex-shrink-0">
                                    <CheckIcon className="w-3 h-3 text-indigo-400"/>
                                </div>
                                <span className="leading-snug">{f}</span>
                            </div>
                        ))}
                    </div>

                    {billingPeriod === 'monthly' && durationMonths > 0 && (
                        <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
                            <p className="text-xs text-blue-200 uppercase font-bold mb-1">Rodzaj umowy</p>
                            <p className="text-sm font-medium text-white">
                                Umowa na <span className="font-bold text-blue-300">{durationMonths} miesięcy</span>, płatna w ratach.
                            </p>
                        </div>
                    )}

                    <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-row items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-500/20 p-2 rounded-lg hidden xs:block">
                                <CalendarIcon className="w-4 h-4"/>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Start</p>
                                <p className="font-medium text-slate-200">{formatDate(effectiveStart)}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px mx-2 sm:mx-4 bg-white/20"></div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                {billingPeriod === 'monthly' ? 'Odnowienie' : 'Koniec'}
                            </p>
                            <p className="font-medium text-slate-200">{formatDate(effectiveEnd)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm">
                            <ShieldCheckIcon className="w-6 h-6 text-indigo-400 flex-shrink-0"/>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Gwarancja</p>
                                <p className="text-xs text-slate-300">14 dni zwrot</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm">
                            <InfoIcon className="w-6 h-6 text-indigo-400 flex-shrink-0"/>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Pomoc</p>
                                <p className="text-xs text-slate-300">24/7</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/10 shadow-lg mb-6">
                    <div className="space-y-2 mb-5 pb-5 border-b border-white/10">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Okres</span>
                            <span className="text-slate-200 font-medium">{durationMonths === 0 ? "7 Dni" : `${durationMonths} mies.`}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Płatność</span>
                            <span className={`font-medium ${billingPeriod === 'upfront' ? 'text-green-400' : 'text-blue-300'}`}>
                                {billingPeriod === 'monthly' ? 'Miesięcznie' : 'Z góry'}
                            </span>
                        </div>
                        {priceIncrease > 0.01 && (
                            <div className="flex justify-between text-sm text-orange-300">
                                <span>Zwyżka (wiek)</span>
                                <span>+{priceIncrease.toFixed(2)} zł</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Netto</span>
                            <span className="text-slate-200 font-medium">{dynamicNetto} zł</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">VAT (23%)</span>
                            <span className="text-slate-200 font-medium">{dynamicVat} zł</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {billingPeriod === 'monthly' && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                                <div className="relative z-10 flex flex-col">
                                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Całkowity koszt</span>
                                    <span className="text-[10px] text-indigo-400/70">Suma za 12 msc</span>
                                </div>
                                <span className="relative z-10 text-lg font-bold text-white tracking-wide">
                                    {dynamicTotalContractValue.toFixed(0)} zł
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                {billingPeriod === 'monthly' ? 'Do zapłaty dzisiaj' : 'Do zapłaty razem'}
                            </span>
                            <span className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
                                {safeAmountToPay.toFixed(2)} <span className="text-xl text-slate-500 font-bold">zł</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 p-4 bg-[#0F172A] border-t border-white/5 flex justify-center flex-shrink-0">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium opacity-60">
                    <LockIcon className="w-3 h-3"/> Płatność szyfrowana SSL 256-bit
                </div>
            </div>
        </div>
    );
}