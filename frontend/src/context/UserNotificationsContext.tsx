import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {useAuth} from "../hooks/useAuth.ts";

export interface INotification {
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type: string;
}

interface INotificationsContext {
    notifications: INotification[];
    unreadCount: number;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => void;
}

const UserNotificationsContext = createContext<INotificationsContext>(null as any);

export const UserNotificationsProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<INotification[]>([]);

    const fetchNotifications = async () => {
        if (!token) {
            setNotifications([]);
            return;
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(await res.json());
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) { console.error(e); }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) { console.error(e); }
    };

    return (
        <UserNotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications: fetchNotifications }}>
            {children}
        </UserNotificationsContext.Provider>
    );
};

export const useUserNotifications = () => useContext(UserNotificationsContext);