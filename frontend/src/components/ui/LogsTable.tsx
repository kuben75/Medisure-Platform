import {useEffect, useState} from "react"
import type {ISystemLog} from "../../types/dashboard.types.ts"
import {useAuth} from "../../hooks/useAuth.ts";

const API_URL_LOGS = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/admin/logs`

export default function LogsTable() {
    const [logs, setLogs] = useState<ISystemLog[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const { token } = useAuth()
    const [levelFilter, setLevelFilter] = useState("All")
    const fetchLogs = async () => {
        if (!token) return

        try {
            const params = new URLSearchParams()

            if (search) params.append("search", search)

            if (levelFilter !== "All") {
                params.append("level", levelFilter)
            }
            const url = `${API_URL_LOGS}?${params.toString()}`

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setLogs(data)
            } else {
                console.error("Błąd pobierania logów:", response.status)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchLogs()
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search, levelFilter, token, fetchLogs]);

    return (
        <div className="mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-semibold text-gray-700">Logi Systemowe</h3>
                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                    >
                        <option value="All">Wszystkie poziomy</option>
                        <option value="Info">Info</option>
                        <option value="Success">Success</option>
                        <option value="Warning">Warning</option>
                        <option value="Error">Error</option>
                        <option value="Security">Security</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Szukaj w logach..."
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-grow md:flex-grow-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 max-h-96 overflow-y-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
                    <tr>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Czas</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Poziom</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Akcja</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Opis</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Użytkownik</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-400">Ładowanie logów...</td>
                        </tr>
                    ) : logs.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500 bg-gray-50">
                                Brak logów spełniających kryteria.
                            </td>
                        </tr>
                    ) : (
                        logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="py-3 px-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                            log.level === 'Error' ? 'bg-red-50 text-red-700 border-red-200' :
                                                log.level === 'Warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    log.level === 'Success' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        log.level === 'Security' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                            'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                            {log.level}
                                        </span>
                                </td>
                                <td className="py-3 px-4 font-medium text-gray-700">{log.action}</td>
                                <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={log.description}>
                                    {log.description}
                                </td>
                                <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                                    {log.userName}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}