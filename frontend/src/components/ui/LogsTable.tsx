import SearchIcon from "../icons/SearchIcon.tsx";
import ChevronDownIcon from "../icons/ChevronDownIcon.tsx";
import RefreshIcon from "../icons/RefreshIcon.tsx";
import {useLogs} from "../../hooks/useLogs.ts";
import {LogTableRow} from "../admin/adminLogs/LogTableRow.tsx";
import {LogCardMobile} from "../admin/adminLogs/LogCardMobile.tsx";

export default function LogsTable() {
    const {
        loading,
        filteredLogs,
        displayedLogs,
        hasMore,
        handleShowMore,
        fetchLogs,
        filters
    } = useLogs();

    return (
        <div className="mt-4 md:mt-8">
            <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-200 md:bg-transparent md:p-0 md:border-none">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">Dziennik Zdarzeń</h3>
                    <button onClick={fetchLogs}
                            className="p-2 text-gray-400 hover:text-[#4E61F6] hover:bg-blue-50 rounded-full transition-colors"
                            title="Odśwież">
                        <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}/>
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <input type="text" placeholder="Szukaj..."
                               className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                               value={filters.search} onChange={(e) => filters.setSearch(e.target.value)}
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400"><SearchIcon className="w-4 h-4"/></div>
                    </div>

                    <select
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4E61F6] outline-none bg-white cursor-pointer w-full sm:w-auto"
                        value={filters.level} onChange={(e) => filters.setLevel(e.target.value)}
                    >
                        <option value="Wszystkie">Wszystkie typy</option>
                        <option value="Informacje">Info</option>
                        <option value="Sukces">Success</option>
                        <option value="Ostrzeżenie">Warning</option>
                        <option value="Błąd">Error</option>
                        <option value="Zabezpieczenia">Security</option>
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
                        {loading && displayedLogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-400">Ładowanie danych...</td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-400">Brak logów spełniających
                                    kryteria.
                                </td>
                            </tr>
                        ) : (
                            displayedLogs.map((log) => <LogTableRow key={log.id} log={log}/>)
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="md:hidden">
                {loading && displayedLogs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">Ładowanie danych...</div>
                ) : filteredLogs.length === 0 ? (
                    <div
                        className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">Brak
                        logów.</div>
                ) : (
                    displayedLogs.map((log) => <LogCardMobile key={log.id} log={log}/>)
                )}
            </div>

            {hasMore && (
                <div className="mt-6 flex justify-center pb-4">
                    <button onClick={handleShowMore}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-600 font-medium text-sm rounded-full shadow-sm border border-gray-300 hover:bg-gray-50 hover:text-[#4E61F6] hover:border-[#4E61F6] transition-all active:scale-95">
                        <span>Załaduj więcej</span>
                        <ChevronDownIcon className="w-4 h-4"/>
                        <span
                            className="text-xs text-gray-400 ml-1 font-normal">({displayedLogs.length} z {filteredLogs.length})</span>
                    </button>
                </div>
            )}
        </div>
    );
}