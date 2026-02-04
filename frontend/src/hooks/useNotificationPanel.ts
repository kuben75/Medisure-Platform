import {useUserNotifications} from "./useUserNotifications.ts";
import React, {useEffect, useMemo, useState} from "react";
import {useConfirm} from "./UseConfrim.ts";
import {useNotification} from "./UseNotification.ts";
import {useSearchParams} from "react-router-dom";
import type {INotification} from "../types/notifications.types.ts";

export const useNotificationPanel = () => {
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useUserNotifications()
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState<'all' | 'unread'>('all')
    const confirm = useConfirm()
    const {notify} = useNotification()
    const [searchParams, setSearchParams] = useSearchParams()

    const selectedNotification = notifications.find(n => n.id === selectedId);
    useEffect(() => {
        const idParam = searchParams.get('id');
        if (idParam) {
            const id = parseInt(idParam, 10);
            if (!isNaN(id)) {
                const notification = notifications.find(n => n.id === id);
                if (notification) {
                    setSelectedId(id)
                    if (!notification.isRead)
                        markAsRead(id)

                }
            }
        }
    }, [searchParams, notifications])

    const handleCloseDetails = () => {
        setSelectedId(null);
        searchParams.delete('id');
        setSearchParams(searchParams);
    }
    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.message.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' ? true : !n.isRead
            return matchesSearch && matchesFilter
        })
    }, [notifications, searchTerm, filter])
    const handleSelect = (n: INotification) => {
        setSelectedId(n.id)
        if (!n.isRead) markAsRead(n.id)
        setSearchParams({ ...Object.fromEntries(searchParams), id: n.id.toString() })
    }

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const shouldDelete = await confirm({
            title: "Usuń powiadomienie",
            description: "Czy na pewno chcesz usunąć to powiadomienie? Operacji tej nie można cofnąć.",
            confirmText: "Usuń",
            cancelText: "Anuluj",
            variant: "danger"
        })
        if (shouldDelete) {
            await deleteNotification(id)
            if (selectedId === id) setSelectedId(null)
            notify.success("Powiadomienie zostało usunięte.")
        }
    }


    const getIconBg = (type: string) => {
        switch (type) {
            case 'Alert': return 'bg-red-50 border-red-100';
            case 'Success': return 'bg-green-50 border-green-100';
            case 'Purchase': return 'bg-blue-50 border-blue-100';
            case 'Warning': return 'bg-yellow-50 border-yellow-100';
            default: return 'bg-gray-50 border-gray-100';
        }
    }
    return {
        selectedId,
        searchTerm,
        setSearchTerm,
        filter,
        setFilter,
        filteredNotifications,
        selectedNotification,
        handleCloseDetails,
        handleSelect,
        handleDelete,
        getIconBg,
        markAllAsRead
    }
}