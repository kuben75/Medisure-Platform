import {useEffect, useState} from "react"
import type {ISystemLog} from "../../types/dashboard.types.ts"
import {useAuth} from "../../hooks/useAuth.ts";
import SearchIcon from "../icons/SearchIcon.tsx";
import ChevronDownIcon from "../icons/ChevronDownIcon.tsx";
const RefreshIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>

const LogRow = ({ log }: { log: ISystemLog }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getLevelBadge = (level: string) => {
        const base = "px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide";
        switch (level) {
            case 'Error': return <span className={`${base} bg-red-50 text-red-700 border-red-200`}>Error</span>;
            case 'Warning': return <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}>Warning</span>;
            case 'Security': return <span className={`${base} bg-purple-50 text-purple-700 border-purple-200`}>Security</span>;
            case 'Success': return <span className={`${base} bg-green-50 text-green-700 border-green-200`}>Success</span>;
            default: return <span className={`${base} bg-blue-50 text-blue-700 border-blue-200`}>Info</span>;
        }
    };

    return (
        <>
            <tr
                onClick={() => setIsExpanded(!isExpanded)}
                className={`cursor-pointer transition-all border-b border-gray-100 hover:bg-blue-50/30 ${isExpanded ? 'bg-blue-50/50' : ''}`}
            >
                <td className="px-4 py-4 whitespace-nowrap text-gray-500 text-xs font-mono truncate">
                    {new Date(log.timestamp).toLocaleString('pl-PL')}
                </td>
                <td className="px-4 py-4">
                    {getLevelBadge(log.level)}
                </td>
                <td className="px-4 py-4 truncate" title={log.action}>
                    <span className="font-semibold text-gray-700 text-sm">{log.action}</span>
                </td>
                <td className="px-4 py-4 truncate">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-xs truncate">{log.user}</span>
                        {log.userId && <span className="text-[10px] text-gray-400 font-mono truncate">{log.userId.substring(0, 8)}...</span>}
                    </div>
                </td>
                <td className="px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-600 truncate">{log.description}</p>
                        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </td>
            </tr>

            {isExpanded && (
                <tr className="bg-gray-50/50 animate-fade-in">
                    <td colSpan={5} className="px-6 py-4 border-b border-gray-200">
                        <div className="flex gap-3">
                            <div className="flex-grow overflow-hidden">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Treść logu:</p>
                                <p className="text-sm text-gray-800 font-mono whitespace-pre-wrap break-words bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                    {log.description}
                                </p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default function LogsTable() {
    const { token } = useAuth()
    const [logs, setLogs] = useState<ISystemLog[]>([])
    const [loading, setLoading] = useState(true)

    const [filterLevel, setFilterLevel] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')

    const API_URL_LOGS = `${import.meta.env.VITE_API_URL}/admin/logs`;

    const fetchLogs = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL_LOGS}?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const mapped = data.map((l: any) => ({
                    id: l.id,
                    action: l.action,
                    description: l.description,
                    user: l.userName || "System",
                    userId: l.userId,
                    level: l.level || "Info",
                    timestamp: l.createdAt
                }));
                setLogs(mapped);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const filteredLogs = logs.filter(log => {
        const matchesLevel = filterLevel === 'All' || log.level === filterLevel;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            log.description.toLowerCase().includes(searchLower) ||
            log.action.toLowerCase().includes(searchLower) ||
            log.user.toLowerCase().includes(searchLower);

        return matchesLevel && matchesSearch;
    });

    return (
        <div className="mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-800">Dziennik Zdarzeń</h3>
                    <button
                        onClick={fetchLogs}
                        className="p-2 text-gray-400 hover:text-[#4E61F6] hover:bg-blue-50 rounded-full transition-colors"
                        title="Odśwież"
                    >
                        <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <input
                            type="text"
                            placeholder="Szukaj w logach..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400"><SearchIcon className="w-4 h-4"/></div>
                    </div>

                    <select
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4E61F6] outline-none bg-white cursor-pointer"
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                    >
                        <option value="All">Wszystkie typy</option>
                        <option value="Info">Info</option>
                        <option value="Success">Success </option>
                        <option value="Warning">Warning </option>
                        <option value="Error">Error </option>
                        <option value="Security">Security </option>
                    </select>
                </div>
            </div>

            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm text-left table-fixed">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-4 font-bold w-40">Czas</th>
                            <th className="px-4 py-4 font-bold w-28">Poziom</th>
                            <th className="px-4 py-4 font-bold w-48">Akcja</th>
                            <th className="px-4 py-4 font-bold w-48">Użytkownik</th>
                            <th className="px-4 py-4 font-bold">Opis zdarzenia</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading && logs.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-400">Ładowanie danych...</td></tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-400">Brak logów spełniających kryteria.</td></tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <LogRow key={log.id} log={log} />
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}