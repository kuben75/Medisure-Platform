import {useEffect, useState, useMemo} from "react"
import type {ISystemLog} from "../../types/dashboard.types.ts"
import {useAuth} from "../../hooks/useAuth.ts";
import SearchIcon from "../icons/SearchIcon.tsx";
import ChevronDownIcon from "../icons/ChevronDownIcon.tsx";

const RefreshIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>

const formatLogDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
        day: date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
}

const LevelBadge = ({ level }: { level: string }) => {
    const base = "px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide inline-block";
    switch (level) {
        case 'Error': return <span className={`${base} bg-red-50 text-red-700 border-red-200`}>Error</span>;
        case 'Warning': return <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}>Warning</span>;
        case 'Security': return <span className={`${base} bg-purple-50 text-purple-700 border-purple-200`}>Security</span>;
        case 'Success': return <span className={`${base} bg-green-50 text-green-700 border-green-200`}>Success</span>;
        default: return <span className={`${base} bg-blue-50 text-blue-700 border-blue-200`}>Info</span>;
    }
}

const LogDetails = ({ log }: { log: ISystemLog }) => (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-xs font-mono text-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 pb-2 border-b border-gray-100">
            <div><span className="text-gray-400">ID:</span> {log.id}</div>
            <div><span className="text-gray-400">User ID:</span> {log.userId || '-'}</div>
        </div>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{log.description}</p>
    </div>
)


const LogRowDesktop = ({ log }: { log: ISystemLog }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { day, time } = formatLogDate(log.timestamp);

    return (
        <>
            <tr
                onClick={() => setIsExpanded(!isExpanded)}
                className={`cursor-pointer transition-all border-b border-gray-100 hover:bg-blue-50/30 ${isExpanded ? 'bg-blue-50/50' : ''}`}
            >
                <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700 font-mono">{day}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{time}</span>
                    </div>
                </td>

                <td className="px-4 py-4">
                    <LevelBadge level={log.level} />
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
                        <p className="text-sm text-gray-600 truncate max-w-[300px]">{log.description}</p>
                        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-50/50 animate-fade-in">
                    <td colSpan={5} className="px-6 py-4 border-b border-gray-200">
                        <LogDetails log={log} />
                    </td>
                </tr>
            )}
        </>
    );
};

const LogCardMobile = ({ log }: { log: ISystemLog }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-3">
            <div className="flex justify-between items-start mb-3" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(log.timestamp).toLocaleString('pl-PL')}
                    </span>
                    <h4 className="font-bold text-gray-800 text-sm">{log.action}</h4>
                </div>
                <LevelBadge level={log.level} />
            </div>

            <div className="flex justify-between items-center text-xs text-gray-600 mb-3 border-t border-gray-100 pt-2">
                <span className="font-semibold">Użytkownik:</span>
                <span>{log.user}</span>
            </div>

            <div
                className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-500 uppercase text-[10px]">Treść</span>
                    <ChevronDownIcon className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
                <p className={`font-mono break-words ${isExpanded ? '' : 'truncate'}`}>
                    {log.description}
                </p>
            </div>

            {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
                    <LogDetails log={log} />
                </div>
            )}
        </div>
    )
}


export default function LogsTable() {
    const { token } = useAuth()
    const [logs, setLogs] = useState<ISystemLog[]>([])
    const [loading, setLoading] = useState(true)

    const [filterLevel, setFilterLevel] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')

    const [visibleCount, setVisibleCount] = useState(10)

    const API_URL_LOGS = `${import.meta.env.VITE_API_URL}/admin/logs`

    const fetchLogs = async () => {
        if (!token) return
        setLoading(true)
        try {
            const response = await fetch(`${API_URL_LOGS}?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

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
                setLogs(mapped)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
        const interval = setInterval(fetchLogs, 30000)
        return () => clearInterval(interval)
    }, [token])

    useEffect(() => {
        setVisibleCount(10)
    }, [filterLevel, searchTerm])

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesLevel = filterLevel === 'All' || log.level === filterLevel;
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                log.description.toLowerCase().includes(searchLower) ||
                log.action.toLowerCase().includes(searchLower) ||
                log.user.toLowerCase().includes(searchLower);

            return matchesLevel && matchesSearch;
        });
    }, [logs, filterLevel, searchTerm]);

    const displayedLogs = filteredLogs.slice(0, visibleCount);
    const hasMore = visibleCount < filteredLogs.length;

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    return (
        <div className="mt-4 md:mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-200 md:bg-transparent md:p-0 md:border-none">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">Dziennik Zdarzeń</h3>
                    <button
                        onClick={fetchLogs}
                        className="p-2 text-gray-400 hover:text-[#4E61F6] hover:bg-blue-50 rounded-full transition-colors"
                        title="Odśwież"
                    >
                        <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <input
                            type="text"
                            placeholder="Szukaj..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400"><SearchIcon className="w-4 h-4"/></div>
                    </div>

                    <select
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4E61F6] outline-none bg-white cursor-pointer w-full sm:w-auto"
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
                <div className="overflow-hidden">
                    <table className="w-full text-sm text-left table-fixed">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-4 font-bold w-28">Czas</th>
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
                            displayedLogs.map((log) => (
                                <LogRowDesktop key={log.id} log={log} />
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="md:hidden">
                {loading && logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">Ładowanie danych...</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">Brak logów.</div>
                ) : (
                    displayedLogs.map((log) => (
                        <LogCardMobile key={log.id} log={log} />
                    ))
                )}
            </div>

            {hasMore && (
                <div className="mt-6 flex justify-center pb-4">
                    <button
                        onClick={handleShowMore}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-600 font-medium text-sm rounded-full shadow-sm border border-gray-300 hover:bg-gray-50 hover:text-[#4E61F6] hover:border-[#4E61F6] transition-all active:scale-95"
                    >
                        <span>Załaduj więcej</span>
                        <ChevronDownIcon className="w-4 h-4" />
                        <span className="text-xs text-gray-400 ml-1 font-normal">
                            ({displayedLogs.length} z {filteredLogs.length})
                        </span>
                    </button>
                </div>
            )}

        </div>
    );
}