import Modal from '../ui/Modal';
import Button from '../ui/Button';
import CalendarIcon from '../icons/CalendarIcon';
import LockIcon from '../icons/LockIcon';
import type {SubscriptionDetailsModalProps} from "../../types/pricing.types.ts";
import BriefcaseIcon from "../icons/BriefcaseIcon.tsx";
import CheckCircleIcon from "../icons/CheckCircleIcon.tsx";
import type {IUserSubscription} from "../../types/user.types.ts";
import ClockIcon from "../icons/ClockIcon.tsx";
import {useState} from "react";
import {useNotification} from "../../hooks/UseNotification.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { generatePolicyPDF } from "../../utils/pdfGenerator.ts";

export default function SubscriptionDetailsModal({ isOpen, onClose, subscription }: SubscriptionDetailsModalProps) {
    const { notify } = useNotification()
    const { user } = useAuth()
    const [isDownloading, setIsDownloading] = useState(false)

    if (!subscription) return null

    const formatDate = (dateString: string | Date) => new Date(dateString).toLocaleDateString('pl-PL', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    })

    const endDate = new Date(subscription.endDate);
    const now = new Date();
    const isExpired = endDate < now;

    const handleDownload = async () => {
        setIsDownloading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))

            await generatePolicyPDF(
                subscription,
                `${user?.firstName} ${user?.lastName}`,
                user?.pesel
            )

            notify.success("Potwierdzenie zostało pobrane.")
        } catch (error) {
            console.error(error)
            notify.error("Błąd podczas generowania PDF.")
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">

            <div className="text-center mb-6">
                {isExpired ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
                        <ClockIcon className="w-6 h-6"/> Wygasła
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
                        <CheckCircleIcon className="w-6 h-6"/> Aktywna Polisa
                    </span>
                )}

                <h2 className={`text-2xl font-bold ${isExpired ? 'text-gray-400 line-through decoration-2' : 'text-gray-900'}`}>
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
                    <div className="text-gray-300 text-xl">➜</div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Koniec</p>
                        <p className={`font-medium ${isExpired ? 'text-red-500' : 'text-gray-800'}`}>
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
                    <div className="flex justify-between items-end pt-2 border-t border-slate-200 mt-2">
                        <span className="text-gray-600 font-bold">Opłacono:</span>
                        <span className="text-xl font-bold text-[#4E61F6]">{subscription.price}</span>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                    <LockIcon className="w-6 h-6"/> Zakres aktywnej ochrony
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
        </Modal>
    )
}