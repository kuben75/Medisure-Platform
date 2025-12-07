import {type ReactNode, useEffect, useState} from 'react';
import {useAuth} from "../hooks/useAuth.ts";
import type {INotification} from "../types/notifications.types.ts";
import {UserNotificationsContext as UserNotificationsContext1} from "../hooks/useUserNotifications.ts";


export const UserNotificationsProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth()
    const [notifications, setNotifications] = useState<INotification[]>([])
    const API_URL = `${import.meta.env.VITE_API_URL}`
    const fetchNotifications = async () => {
        if (!token) {
            setNotifications([])
            return
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) setNotifications(await res.json())

        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [token])

    const unreadCount = notifications.filter(n => !n.isRead).length

    const markAsRead = async (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) { console.error(e); }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) { console.error(e); }
    };
    const deleteNotification = async (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));

        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
        } catch (e) {
            console.error("Błąd usuwania powiadomienia", e);
        }
    }
    return (
        <UserNotificationsContext1 value={{ notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications: fetchNotifications, deleteNotification }}>
            {children}
        </UserNotificationsContext1>
    )
}

