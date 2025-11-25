import {createContext, useContext, useState, useCallback, type ReactNode} from 'react';
import CheckIcon from "../components/icons/CheckIcon.tsx";
import ErrorIcon from "../components/icons/ErrorIcon.tsx";
import InfoIcon from "../components/icons/InfoIcon.tsx";
import XIcon from "../components/icons/XIcon.tsx";

import type {INotification, INotificationContextType, TNotificationType} from "../types/notifications.types.ts";



const NotificationContext = createContext<INotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<INotification[]>([])

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, [])

    const addNotification = useCallback((message: string, type: TNotificationType) => {
        const id = Date.now()
        setNotifications((prev) => [...prev, { id, message, type }])

        setTimeout(() => {
            removeNotification(id)
        }, 4000)
    }, [removeNotification])

    const notify = {
        success: (msg: string) => addNotification(msg, 'success'),
        error: (msg: string) => addNotification(msg, 'error'),
        info: (msg: string) => addNotification(msg, 'info'),
    }

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}

            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`
                            flex items-center gap-3 px-4 py-3 min-w-[300px] max-w-md
                            bg-white rounded-lg shadow-lg border-l-4 transition-all duration-300 animate-slide-in
                            ${n.type === 'success' ? 'border-green-500' : ''}
                            ${n.type === 'error' ? 'border-red-500' : ''}
                            ${n.type === 'info' ? 'border-blue-500' : ''}
                        `}
                    >
                        <div className="flex-shrink-0">
                            {n.type === 'success' && <CheckIcon className="w-6 h-6 text-green-500"/>}
                            {n.type === 'error' && <ErrorIcon className="w-6 h-6 text-red-500"/>}
                            {n.type === 'info' && <InfoIcon className="w-6 h-6 text-blue-500"/>}
                        </div>

                        <p className="text-sm font-medium text-gray-800 flex-grow">{n.message}</p>

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
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};