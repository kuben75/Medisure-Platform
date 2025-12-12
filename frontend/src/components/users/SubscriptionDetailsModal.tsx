import Modal from '../ui/Modal';
import Button from '../ui/Button';
import CalendarIcon from '../icons/CalendarIcon';
import LockIcon from '../icons/LockIcon';
import type {ISubscriptionDetailsModalProps} from "../../types/pricing.types.ts";
import BriefcaseIcon from "../icons/BriefcaseIcon.tsx";
import CheckCircleIcon from "../icons/CheckCircleIcon.tsx";
import type {IUserSubscription} from "../../types/user.types.ts";
import ClockIcon from "../icons/ClockIcon.tsx";
import {useState} from "react";
import {useNotification} from "../../hooks/UseNotification.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { generatePolicyPDF } from "../../utils/pdfGenerator.ts";
import { useConfirm } from "../../hooks/UseConfrim.ts";
import AlertIcon from "../icons/AlertIcon.tsx";


export default function SubscriptionDetailsModal({ isOpen, onClose, subscription, onRefresh }: ISubscriptionDetailsModalProps) {
    const { notify } = useNotification()
    const { user, token } = useAuth()
    const confirm = useConfirm()
    const [isDownloading, setIsDownloading] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    if (!subscription) return null

    const formatDate = (dateString: string | Date) => new Date(dateString).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
    })

    const startDate = new Date(subscription.startDate)
    const endDate = new Date(subscription.endDate)
    const now = new Date()

    const isExpired = endDate < now
    const isPending = startDate > now
    const isCancelled = subscription.status === 'Cancelled'

    const isMonthly = subscription.price?.includes('/ mies') || (subscription as any).billingPeriod === 'monthly'

    let dateLabel = "Koniec ochrony"
    let dateColorClass = "text-gray-800"
    let badge = null

    if (isExpired) {
        dateLabel = "Wygasła";
        dateColorClass = "text-red-500 font-bold";
        badge = (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
                <ClockIcon className="w-5 h-5"/> Historyczna
            </span>
        );
    } else if (isPending) {
        dateLabel = "Startuje";
        dateColorClass = "text-blue-600 font-bold";
        badge = (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
                <ClockIcon className="w-5 h-5"/> Oczekująca
            </span>
        );
    } else if (isCancelled) {
        dateLabel = "Wygasa";
        dateColorClass = "text-orange-600 font-bold";
        badge = (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
                <AlertIcon className="w-5 h-5"/>Wygasa wkrótce
            </span>
        )
    } else {
        if (isMonthly) {
            dateLabel = "Odnawia się";
            dateColorClass = "text-green-600 font-bold";
        } else {
            dateLabel = "Koniec umowy";
            dateColorClass = "text-gray-800 font-bold";
        }

        badge = (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
                <CheckCircleIcon className="w-5 h-5"/> Aktywna Polisa
            </span>
        );
    }

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            await generatePolicyPDF(
                subscription,
                `${user?.firstName} ${user?.lastName}`,
                user?.pesel ?? ''
            )
            notify.success("Potwierdzenie zostało pobrane.")
        } catch (error) {
            console.error(error)
            notify.error("Błąd podczas generowania PDF.")
        } finally {
            setIsDownloading(false)
        }
    }

    const handleCancelSubscription = async () => {
        const confirmed = await confirm({
            title: "Anulowanie subskrypcji",
            description: `Czy na pewno chcesz anulować? Pakiet pozostanie aktywny do ${formatDate(subscription.endDate)}, po czym wygaśnie.`,
            confirmText: "Tak, anuluj",
            cancelText: "Wróć",
            variant: "danger"
        });

        if (!confirmed) return;

        setIsCancelling(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/${subscription.id}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || "Nie udało się anulować subskrypcji.")
            }

            notify.success("Subskrypcja została anulowana.")
            if(onRefresh) onRefresh()
            onClose()

        } catch (error) {
            notify.error(error instanceof Error ? error.message : "Błąd podczas anulowania subskrypcji.")
        } finally {
            setIsCancelling(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">

            <div className="text-center mb-6">
                {badge}

                <h2 className={`text-2xl font-bold ${isExpired || isCancelled ? 'text-gray-500' : 'text-gray-900'}`}>
                    {subscription.packageName}
                </h2>
                <p className="text-gray-500 text-sm">Szczegóły Twojego ubezpieczenia</p>
            </div>

            <div className={`bg-slate-50 rounded-xl p-6 border border-slate-100 mb-6 ${isExpired ? 'opacity-70 grayscale' : ''}`}>
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-[#4E61F6] w-10 h-10 flex items-center justify-center">
                            <CalendarIcon />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Start</p>
                            <p className="font-medium text-gray-800">{formatDate(subscription.startDate)}</p>
                        </div>
                    </div>

                    <div className="flex-1 px-4 flex flex-col items-center">
                        <div className="w-full h-px bg-slate-300 relative top-3"></div>
                        <span className="text-gray-400 text-xl relative bg-slate-50 px-2">➜</span>
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{dateLabel}</p>
                        <p className={`font-medium ${dateColorClass}`}>
                            {formatDate(subscription.endDate)}
                        </p>
                    </div>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Numer transakcji:</span>
                        <span className="font-mono text-gray-800 font-medium">
                            {(subscription as IUserSubscription).transactionId || 'BRAK DANYCH'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Metoda płatności:</span>
                        <span className="font-medium text-gray-800 capitalize">
                            {(subscription as IUserSubscription).paymentMethod || 'Karta'}
                        </span>
                    </div>

                    {isMonthly && !isExpired && !isPending && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Automatyczne odnawianie:</span>
                            <span className={`font-bold ${isCancelled ? 'text-red-500' : 'text-green-600'}`}>
                                {isCancelled ? 'Wyłączone' : 'Włączone'}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-end pt-2 border-t border-slate-200 mt-2">
                        <span className="text-gray-600 font-bold">Kwota:</span>
                        <span className="text-xl font-bold text-[#4E61F6]">{subscription.price}</span>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                    <LockIcon className="w-6 h-6"/> Zakres ochrony
                </h4>

                {subscription.features && subscription.features.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                        {subscription.features.map((feature, idx) => (
                            <div key={idx} className={`flex items-center gap-3 text-sm p-2 rounded border transition-colors ${isExpired ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-green-50/50 text-gray-700 border-green-100'}`}>
                                <div className={`w-4 h-4 ${isExpired ? 'text-gray-400' : 'text-green-500'}`}>
                                    <CheckCircleIcon className="w-4 h-4"/>
                                </div>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">Brak szczegółowych danych o zakresie.</p>
                )}
            </div>

            <div className="flex gap-3 flex-col">
                <div className="flex gap-3 flex-col md:flex-row">
                    <Button variant="secondary" onClick={onClose} className="w-full border-gray-200">
                        Zamknij
                    </Button>

                    <Button
                        variant="primary"
                        className="w-full flex items-center justify-center gap-2 shadow-lg"
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        {isDownloading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Generowanie...
                            </>
                        ) : (
                            <>
                                <div className="w-4 h-4"><BriefcaseIcon className="w-4 h-4" /></div>
                                Pobierz potwierdzenie
                            </>
                        )}
                    </Button>
                </div>

                {isMonthly && !isExpired && !isCancelled && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-center animate-fade-in">
                        <p className="text-xs text-gray-400 mb-2">Zarządzanie subskrypcją</p>
                        <button
                            onClick={handleCancelSubscription}
                            disabled={isCancelling}
                            className="text-red-500 hover:text-red-700 text-sm font-medium underline hover:no-underline transition-colors disabled:opacity-50 hover:bg-red-50 px-4 py-2 rounded-lg"
                        >
                            {isCancelling ? 'Przetwarzanie...' : 'Anuluj subskrypcję i wyłącz odnawianie'}
                        </button>
                    </div>
                )}

                {isCancelled && !isExpired && (
                    <div className="mt-4 pt-2 text-center text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                        Twoja subskrypcja została anulowana. Dostęp wygaśnie {formatDate(endDate)}.
                    </div>
                )}
            </div>
        </Modal>
    )
}