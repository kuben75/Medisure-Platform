import Button from '../ui/Button.tsx';
import MegaphoneIcon from "../icons/MegaphoneIcon.tsx";
import AlertIcon from "../icons/AlertIcon.tsx";
import CheckCircleIcon from "../icons/CheckCircleIcon.tsx";
import InfoIcon from "../icons/InfoIcon.tsx";
import type { TNotificationType } from "../../types/notifications.types.ts";
import {useBroadcastPanel} from "../../hooks/useBroadcast.ts";

export default function BroadcastPanel() {
    const {
        title, setTitle,
        message, setMessage,
        type, setType,
        loading,
        handleSend
    } = useBroadcastPanel();

    const getTypeStyles = (t: string) => {
        switch (t) {
            case 'Alert': return { bg: 'bg-red-50', border: 'border-red-200', iconColor: 'text-red-500', icon: <AlertIcon /> };
            case 'Success': return { bg: 'bg-green-50', border: 'border-green-200', iconColor: 'text-green-500', icon: <CheckCircleIcon /> };
            case 'Warning': return { bg: 'bg-yellow-50', border: 'border-yellow-200', iconColor: 'text-yellow-600', icon: <AlertIcon /> };
            default: return { bg: 'bg-blue-50', border: 'border-blue-200', iconColor: 'text-blue-500', icon: <InfoIcon /> };
        }
    }

    const previewStyle = getTypeStyles(type);

    return (
        <div className="mt-4 md:mt-8 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 flex flex-col lg:flex-row gap-10">

            <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                        <MegaphoneIcon />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Nadaj komunikat</h3>
                        <p className="text-xs text-gray-500">Wiadomość trafi do wszystkich użytkowników systemu.</p>
                    </div>
                </div>

                <form onSubmit={handleSend} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Tytuł</label>
                            <input
                                type="text"
                                value={title} onChange={e => setTitle(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none transition-all text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Priorytet</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value as TNotificationType)}
                                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none bg-white cursor-pointer text-sm"
                            >
                                <option value="Info">Informacja </option>
                                <option value="Success">Sukces </option>
                                <option value="Warning">Ostrzeżenie ️</option>
                                <option value="Alert">Krytyczny </option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Treść</label>
                        <textarea
                            value={message} onChange={e => setMessage(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-xl h-32 focus:ring-2 focus:ring-[#4E61F6] outline-none resize-none transition-all text-sm"
                            required
                        />
                        <div className="flex justify-between mt-1 text-xs text-gray-400">
                            <span className="hidden sm:inline">Unikaj długich bloków tekstu</span>
                            <span>{message.length} znaków</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={loading} className="w-full py-3 shadow-lg font-bold text-sm">
                            {loading ? "Wysyłanie..." : "Wyślij do wszystkich"}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="lg:w-1/3 bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col justify-center mt-6 lg:mt-0">
                <p className="text-xs font-bold text-gray-400 uppercase mb-4 text-center tracking-widest">Podgląd odbiorcy</p>

                <div className={`bg-white p-4 rounded-xl border-l-4 shadow-sm ${previewStyle.border} relative overflow-hidden transition-all duration-300`}>
                    <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${previewStyle.bg} ${previewStyle.iconColor}`}>
                            {previewStyle.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-gray-900 text-sm truncate">
                                    {title || "Tytuł ogłoszenia..."}
                                </h4>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">Teraz</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed break-words line-clamp-3">
                                {message || "Tutaj pojawi się treść Twojego komunikatu dla użytkowników."}
                            </p>
                        </div>
                    </div>
                    <div className="absolute top-4 right-2 w-2 h-2 bg-[#4E61F6] rounded-full border border-white shadow-sm"></div>
                </div>

                <div className="mt-8 text-center hidden md:block">
                    <p className="text-xs text-gray-500">
                        Odbiorcy: <strong className="text-gray-800">Wszyscy użytkownicy</strong>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Powiadomienie pojawi się w panelu oraz przy dzwonku.</p>
                </div>
            </div>
        </div>
    )
}