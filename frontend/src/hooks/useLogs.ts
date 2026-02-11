import {useState, useEffect, useMemo, useCallback} from "react";
import {useAuth} from "./useAuth.ts";
import type {ISystemLog} from "../types/dashboard.types.ts";

const API_URL_LOGS = `${import.meta.env.VITE_API_URL}/admin/logs`;

export const useLogs = () => {
    const {token} = useAuth();
    const [logs, setLogs] = useState<ISystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterLevel, setFilterLevel] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(10);

    const fetchLogs = useCallback(async () => {
        if (!token) {
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL_LOGS}?limit=500`, {
                headers: {'Authorization': `Bearer ${token}`}
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
            console.error("Błąd pobierania logów:", e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLogs().then(() => console.log("Logi załadowane"));
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, [fetchLogs]);

    useEffect(() => {
        setVisibleCount(10);
    }, [filterLevel, searchTerm]);

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

    const handleShowMore = () => setVisibleCount(prev => prev + 10);

    return {
        logs,
        loading,
        filteredLogs,
        displayedLogs,
        hasMore,
        handleShowMore,
        fetchLogs,
        filters: {
            level: filterLevel,
            setLevel: setFilterLevel,
            search: searchTerm,
            setSearch: setSearchTerm
        }
    }
}