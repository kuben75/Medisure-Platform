import {useEffect, useState} from "react";
import {StatCard} from "../ui/StatCard.tsx";
import type {IDashboardStats} from "../../types/dashboard.types.ts";
import LogsTable from "../ui/LogsTable.tsx";
import {useAuth} from "../../hooks/useAuth.ts";
const API_URL_STATS = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/admin/stats`;

const UsersIconDashboard = ({ className = "w-8 h-8" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM8.25 21a6.375 6.375 0 005.24-3.07" /></svg>);
const PackageIconDashboard = ({ className = "w-8 h-8" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 11.25h3M10.5 15h3M3.375 5.625c0-1.036.84-1.875 1.875-1.875h13.5c1.036 0 1.875.84 1.875 1.875v1.875c0 1.036-.84 1.875-1.875 1.875H5.25c-1.036 0-1.875-.84-1.875-1.875V5.625z" /></svg>);
const ActiveIconDashboard = ({ className = "w-8 h-8" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>);
const WarningIconDashboard = ({ className = "w-8 h-8" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>);

export const Dashboard = () => {
    const [stats, setStats] = useState<IDashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { token } = useAuth()

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) {
                setError("Brak autoryzacji do pobrania statystyk.")
                setLoading(false)
                return
            }
            try {
                setLoading(true)
                const response = await fetch(API_URL_STATS, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (!response.ok) throw new Error('Błąd pobierania statystyk')
                const data = await response.json()
                setStats(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err))
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [token])

    if (loading) return <div>Ładowanie statystyk...</div>
    if (error) return <div className="text-red-500">Błąd: {error}</div>
    if (!stats) return null
    return (
        <div className="mt-8 bg-slate-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Panel Główny</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Wszyscy użytkownicy" value={stats.totalUsers} icon={<UsersIconDashboard />} colorClass="bg-blue-50 text-blue-600"/>
                <StatCard title="Pakiety w ofercie" value={stats.totalPackagesAvailable} icon={<PackageIconDashboard />} colorClass="bg-green-50 text-green-600"/>
                <StatCard title="Aktywne subskrypcje" value={stats.activeSubscriptions} icon={<ActiveIconDashboard />} colorClass="bg-indigo-50 text-indigo-600"/>
                <StatCard title="Subskrypcje wygasające (7 dni)" value={stats.expiringSubscriptions} icon={<WarningIconDashboard />} colorClass="bg-yellow-50 text-yellow-600"/>
            </div>
            <LogsTable />
        </div>
    )
}