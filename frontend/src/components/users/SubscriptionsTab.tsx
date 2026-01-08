import {useState} from 'react';
import CalendarIcon from '../icons/CalendarIcon.tsx';
import EyeIcon from '../icons/EyeIcon.tsx';
import SearchIcon from '../icons/SearchIcon.tsx';
import StarIconOutline from '../icons/StarIconOutline.tsx';
import BriefcaseIcon from '../icons/BriefcaseIcon.tsx';
import Button from '../ui/Button.tsx';
import type {ISubscriptionsTabProps} from "../../types/user.types.ts";

export default function SubscriptionsTab({
                                             subscriptions, searchTerm, setSearchTerm, onOpenDetails, onOpenReview, onBrowse
                                         }: ISubscriptionsTabProps) {
    const [visibleCount, setVisibleCount] = useState(3);
    const displayed = subscriptions.slice(0, visibleCount);
    const hasMore = subscriptions.length > visibleCount;

    const getStatusBadge = (status: string, end: string, start: string) => {
        const now = new Date();
        if (status === 'Cancelled') return <Badge color="bg-gray-500" text="ANULOWANA" />;
        if (new Date(start) > now) return <Badge color="bg-blue-500" text="OCZEKUJĄCA" />;
        if (new Date(end) < now) return <Badge color="bg-red-500" text="WYGASŁA" />;
        return <Badge color="bg-green-500" text="AKTYWNA" />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-800">Aktywne umowy <span className="text-gray-400 font-normal text-base">({subscriptions.length})</span></h2>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text" placeholder="Szukaj..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-[#4E61F6] outline-none bg-gray-50 focus:bg-white transition-all"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400"><SearchIcon className="w-4 h-4" /></div>
                </div>
            </div>

            {displayed.length > 0 ? (
                <>
                    <div className="grid gap-4">
                        {displayed.map(sub => (
                            <div key={sub.id} className="group border border-gray-200 rounded-xl p-5 hover:border-[#4E61F6] hover:shadow-md transition-all bg-white relative overflow-hidden">
                                {getStatusBadge(sub.status, sub.endDate, sub.startDate)}
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 mt-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#4E61F6] transition-colors">{sub.packageName}</h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pakiet Medyczny</p>
                                    </div>
                                    <span className="text-[#4E61F6] font-bold text-xl">{sub.price}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg w-fit">
                                    <CalendarIcon className="w-4 h-4 text-gray-400"/>
                                    <span>Ważny do: <b className="text-gray-800">{new Date(sub.endDate).toLocaleDateString('pl-PL')}</b></span>
                                </div>
                                <div className="flex justify-end gap-3 border-t border-gray-100 pt-3">
                                    <button onClick={() => onOpenDetails(sub)} className="text-xs font-bold text-gray-600 hover:text-[#4E61F6] flex items-center gap-1 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#4E61F6] transition-all"><EyeIcon className="w-3 h-3"/> Szczegóły</button>
                                    <button onClick={() => onOpenReview(sub.packageId, sub.packageName)} className="text-xs font-bold text-yellow-700 hover:text-yellow-800 flex items-center gap-1 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg hover:bg-yellow-100 transition-all"><StarIconOutline className="w-3 h-3"/> Oceń</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {(hasMore || visibleCount > 5) && (
                        <div className="text-center pt-4">
                            <button onClick={() => setVisibleCount(hasMore ? visibleCount + 5 : 5)} className="text-sm font-bold text-[#4E61F6] hover:bg-blue-50 px-6 py-2 rounded-full transition-colors">
                                {hasMore ? `Pokaż więcej (${subscriptions.length - visibleCount}) ▼` : "Zwiń listę ▲"}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyState msg={searchTerm ? "Nie znaleziono pakietów." : "Nie masz jeszcze aktywnych pakietów."} btnAction={onBrowse} btnText={searchTerm ? "Wyczyść" : "Przeglądaj ofertę"} />
            )}
        </div>
    )
}

const Badge = ({color, text}: {color: string, text: string}) => (
    <div className={`absolute top-0 right-0 ${color} text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm`}>{text}</div>
)

const EmptyState = ({msg, btnAction, btnText}: any) => (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50 flex flex-col items-center justify-center h-64">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4"><BriefcaseIcon className="w-8 h-8 text-gray-300"/></div>
        <p className="text-gray-500 font-medium mb-6">{msg}</p>
        <Button onClick={btnAction} variant="primary" className="!text-sm !py-2.5 shadow-lg">{btnText}</Button>
    </div>
)