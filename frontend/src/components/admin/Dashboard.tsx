import {useEffect, useState} from "react";
import {StatCard} from "../ui/StatCard.tsx";
import type {IDashboardStats} from "../../types/dashboard.types.ts";
import LogsTable from "../ui/LogsTable.tsx";
import {useAuth} from "../../hooks/useAuth.ts";
import {UsersIconDashboard} from "../icons/UsersIconDashboard.tsx";
import {PackageIconDashboard} from "../icons/PackageIconDashboard.tsx";
import {ActiveIconDashboard} from "../icons/ActiveIconDashboard.tsx";
import {WarningIconDashboard} from "../icons/WarningIconDashboard.tsx";

const API_URL_STATS = `${import.meta.env.VITE_API_URL}/admin/stats`;

export const Dashboard = () => {
    const [stats, setStats] = useState<IDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {token} = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) {
                setError("Brak autoryzacji do pobrania statystyk.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await fetch(API_URL_STATS, {
                    headers: {'Authorization': `Bearer ${token}`}
                });
                if (!response.ok) {
                    throw new Error('Błąd pobierania statystyk');
                }
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    if (loading) {
        return <div>Ładowanie statystyk...</div>;
    }
    if (error) {
        return <div className="text-red-500">Błąd: {error}</div>;
    }
    if (!stats) {
        return null;
    }
    return (
        <div className="mt-8 bg-slate-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Panel Główny</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Wszyscy użytkownicy" value={stats.totalUsers} icon={<UsersIconDashboard/>}
                          colorClass="bg-blue-50 text-blue-600"/>
                <StatCard title="Pakiety w ofercie" value={stats.totalPackagesAvailable} icon={<PackageIconDashboard/>}
                          colorClass="bg-green-50 text-green-600"/>
                <StatCard title="Aktywne subskrypcje" value={stats.activeSubscriptions} icon={<ActiveIconDashboard/>}
                          colorClass="bg-indigo-50 text-indigo-600"/>
                <StatCard title="Subskrypcje wygasające (7 dni)" value={stats.expiringSubscriptions}
                          icon={<WarningIconDashboard/>} colorClass="bg-yellow-50 text-yellow-600"/>

            </div>
            <LogsTable/>
        </div>
    )
}