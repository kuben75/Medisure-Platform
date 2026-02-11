export type TNotificationType = 'Info' | 'Alert' | 'Success' | 'Warning'

export interface INotification {
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type: string;
}

export interface INotificationContextType {
    notify: {
        success: (msg: string) => void
        error: (msg: string) => void
        info: (msg: string) => void
    };
}

export interface INotificationsContext {
    notifications: INotification[];
    unreadCount: number;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => void;
    deleteNotification: (id: number) => Promise<void>;
}

export interface IConfirmOptions {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'info';
}

export interface IConfirmationContextType {
    confirm: (options: IConfirmOptions) => Promise<boolean>;
}

export interface ApiError {
    success: boolean;
    message: string;
    errorCode?: number;
}