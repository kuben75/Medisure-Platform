import {type ReactNode, useEffect, useState} from 'react';
import {useAuth} from "../hooks/useAuth.ts";
import type {INotification} from "../types/notifications.types.ts";
import {UserNotificationsContext} from "../hooks/useUserNotifications.ts";
import {handleApiError} from "../utils/apiErrorHandler.ts";
import {useNotification} from "../hooks/UseNotification.ts";


export const UserNotificationsProvider = ({children}: { children: ReactNode }) => {
    const {token} = useAuth();
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const API_URL = `${import.meta.env.VITE_API_URL}/notifications`;
    const {notify} = useNotification();

    const fetchNotifications = async () => {
        if (!token) {
            setNotifications([]);
            return;
        }
        try {
            const res = await fetch(API_URL, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (res.ok) {
                setNotifications(await res.json());
            }

        } catch (e) {
            console.error("Błąd pobierania powiadomień", e);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getError = async (res: Response) => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await res.json();
        }
        return {message: `Błąd serwera: ${res.status}`};
    };

    const markAsRead = async (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n));
        try {
            const res = await fetch(`${API_URL}/${id}/read`, {
                method: 'PUT',
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!res.ok) {
                throw await res.json();
            }
        } catch (e) {
            handleApiError(e, notify);
            await fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
        try {
            const res = await fetch(`${API_URL}/read-all`, {
                method: 'PUT',
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!res.ok) {
                throw await res.json();
            }
        } catch (e) {
            handleApiError(e, notify);
        }
    };
    const deleteNotification = async (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));

        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${token}`}
            });

            if (!res.ok) {
                throw await getError(res);
            }
        } catch (e) {
            handleApiError(e, notify);
            await fetchNotifications();
        }
    };
    return (
        <UserNotificationsContext value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            refreshNotifications: fetchNotifications,
            deleteNotification
        }}>
            {children}
        </UserNotificationsContext>
    )
}

