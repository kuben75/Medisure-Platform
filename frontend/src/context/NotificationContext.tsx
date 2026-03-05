import {type ReactNode, useCallback, useState} from 'react';
import CheckIcon from "../components/icons/CheckIcon.tsx";
import ErrorIcon from "../components/icons/ErrorIcon.tsx";
import InfoIcon from "../components/icons/InfoIcon.tsx";
import XIcon from "../components/icons/XIcon.tsx";
import type {INotification, TNotificationType} from "../types/notifications.types.ts";
import {NotificationContext} from "../hooks/UseNotification.ts";


export const NotificationProvider = ({children}: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<INotification[]>([]);

    const titles: Record<string, string> = {
        success: 'Sukces',
        error: 'Błąd',
        info: 'Informacja',
        warning: 'Uwaga'
    };

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const addNotification = useCallback((message: string, type: TNotificationType) => {
        const id = Date.now();
        const newNotification: INotification = {
            id,
            message,
            type,
            title: titles[type] || (type.charAt(0).toUpperCase() + type.slice(1)),
            isRead: false,
            createdAt: new Date().toISOString()
        };
        setNotifications((prev) => [...prev, newNotification]);
        setTimeout(() => {
            removeNotification(id);
        }, 4000);
    }, [removeNotification]);

    const notify = {

        success: (msg: string) => addNotification(msg, 'success' as TNotificationType),
        error: (msg: string) => addNotification(msg, 'error' as TNotificationType),
        info: (msg: string) => addNotification(msg, 'info' as TNotificationType),
        warning: (msg: string) => addNotification(msg, 'warning' as TNotificationType),
    };

    return (
        <NotificationContext value={{notify}}>
            {children}

            <div className="fixed top-22 right-5 z-[9999] flex flex-col gap-3">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`
                            flex items-center gap-3 px-4 py-3 min-w-[300px] max-w-md
                            bg-white rounded-lg shadow-lg border-l-4 transition-all duration-300 animate-slide-in
                            ${n.type === 'success' ? 'border-green-500' : ''}
                            ${n.type === 'error' ? 'border-red-500' : ''}
                            ${n.type === 'info' ? 'border-blue-500' : ''}
                            ${n.type === 'warning' ? 'border-yellow-500' : ''}
                        `}
                    >
                        <div className="flex-shrink-0">
                            {n.type === 'success' && <CheckIcon className="w-6 h-6 text-green-500"/>}
                            {n.type === 'error' && <ErrorIcon className="w-6 h-6 text-red-500"/>}
                            {n.type === 'info' && <InfoIcon className="w-6 h-6 text-blue-500"/>}
                            {n.type === 'warning' && <InfoIcon className="w-6 h-6 text-yellow-500"/>}
                        </div>

                        <div className="flex-grow">
                            {n.title && <h4 className="text-xs font-bold text-gray-500 uppercase mb-0.5">{n.title}</h4>}
                            <p className="text-sm font-medium text-gray-800">{n.message}</p>
                        </div>


                        <button
                            onClick={() => removeNotification(n.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            < XIcon className="w-6 h-6"/>
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out forwards;
                }
            `}</style>
        </NotificationContext>
    );
};

