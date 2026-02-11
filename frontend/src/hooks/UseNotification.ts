import {createContext, useContext} from "react";
import type {INotificationContextType} from "../types/notifications.types.ts";

export const NotificationContext = createContext<INotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification musi być używane wewnątrz NotificationProvider');
    }

    return context
}