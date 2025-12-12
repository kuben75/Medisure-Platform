import React, {useState, useMemo, useEffect} from 'react';
import Button from '../ui/Button.tsx';
import type {INotification} from "../../types/notifications.types.ts";
import CheckCircleIcon from "../icons/CheckCircleIcon.tsx";
import SearchIcon from "../icons/SearchIcon.tsx";
import CalendarIcon from "../icons/CalendarIcon.tsx";
import {useUserNotifications} from "../../hooks/useUserNotifications.ts";
import {useConfirm} from "../../hooks/UseConfrim.ts";
import {useNotification} from "../../hooks/UseNotification.ts";
import InfoIcon from "../icons/InfoIcon.tsx";
import AlertIcon from "../icons/AlertIcon.tsx";
import BellIcon from "../icons/BellIcon.tsx";
import {useSearchParams} from "react-router-dom";
import DeleteIcon from "../icons/DeleteIcon.tsx";
import ArrowLeftIcon from "../icons/ArrowLeftIcon.tsx";

export default function NotificationsPanel() {
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

    const getIcon = (type: string) => {
        switch (type) {
            case 'Alert': return <AlertIcon className='w-4 h-4 text-red-500'/>
            case 'Success': return <CheckCircleIcon className='w-4 h-4 text-green-500'/>
            case 'Purchase': return <CheckCircleIcon className='w-4 h-4 text-green-500'/>
            case 'Warning': return <AlertIcon className='w-4 h-4 text-red-500'/>
            default: return <InfoIcon className='w-4 h-4 text-blue-500'/>
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

    return (
        <div className="mt-4 md:mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[20vh] md:h-[600px] font-sans">

            <div className={`w-full md:w-1/3 border-r border-gray-200 bg-slate-50 flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>

                <div className="p-4 border-b border-gray-200 bg-white space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Skrzynka odbiorcza</h3>
                        <button onClick={markAllAsRead} className="text-xs text-[#4E61F6] hover:underline flex items-center gap-1 font-medium">
                            <CheckCircleIcon className="w-4 h-4" /> Oznacz wszystkie
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Szukaj powiadomień..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none transition-all"
                        />
                        <div className="absolute left-2.5 top-2.5"><SearchIcon className="w-4 h-4" /></div>
                    </div>

                    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                        <button onClick={() => setFilter('all')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Wszystkie</button>
                        <button onClick={() => setFilter('unread')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'unread' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Nieprzeczytane</button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {filteredNotifications.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-sm">
                            {filter === 'unread' ? "Wszystko przeczytane" : "Brak powiadomień."}
                        </div>
                    ) : (
                        filteredNotifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => handleSelect(n)}
                                className={`p-4 cursor-pointer border-b border-gray-100 transition-all hover:bg-white relative group ${selectedId === n.id ? 'bg-white border-l-4 border-l-[#4E61F6] shadow-sm' : ''} ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${getIconBg(n.type)}`}>
                                        {getIcon(n.type)}
                                    </div>

                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-xs truncate pr-2 ${!n.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}>{n.title}</h4>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className={`text-xs truncate ${!n.isRead ? 'text-gray-800' : 'text-gray-500'}`}>{n.message}</p>
                                    </div>
                                </div>

                                {!n.isRead && <div className="absolute top-4 right-2 w-2 h-2 bg-[#4E61F6] rounded-full border border-white shadow-sm"></div>}

                                <button
                                    onClick={(e) => handleDelete(e, n.id)}
                                    className="absolute bottom-2 right-2 p-1 text-gray-300 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                    title="Usuń powiadomienie"
                                >
                                    <DeleteIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={`w-full md:w-2/3 flex-col bg-white ${selectedId ? 'flex' : 'hidden md:flex'}`}>
                {selectedNotification ? (
                    <div className="flex flex-col h-full animate-fade-in">
                        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start bg-slate-50/30 relative">

                            <button
                                onClick={handleCloseDetails}
                                className="md:hidden absolute top-4 left-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                            >
                                <ArrowLeftIcon />
                            </button>

                            <div className="flex items-start gap-4 mt-8 md:mt-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border ${getIconBg(selectedNotification.type)}`}>
                                    {getIcon(selectedNotification.type)}
                                </div>
                                <div>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-tight pr-8 md:pr-0">{selectedNotification.title}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <CalendarIcon className="w-4 h-4" /> {new Date(selectedNotification.createdAt).toLocaleString()}
                                        </p>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded font-bold uppercase border border-gray-200">
                                            {selectedNotification.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow p-6 md:p-8 overflow-y-auto">
                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {selectedNotification.message}
                            </div>
                        </div>

                        <div className="p-4 md:p-6 border-t border-gray-100 flex justify-between gap-3 bg-white">
                            <Button variant="danger" onClick={(e) => handleDelete(e, selectedNotification.id)} className="!text-xs !py-2 border-red-200 text-red-600 hover:bg-red-50">Usuń</Button>
                            <Button variant="primary" onClick={handleCloseDetails} className="!text-xs !py-2 hidden md:block">Zamknij szczegóły</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-slate-50/50 p-4 text-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                            <BellIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-300"/>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-gray-600">Centrum Powiadomień</h3>
                        <p className="text-xs md:text-sm mt-2">Wybierz wiadomość z listy, aby zobaczyć szczegóły.</p>
                    </div>
                )}
            </div>
        </div>
    )
}