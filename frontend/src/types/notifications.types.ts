export type TNotificationType = 'success' | 'error' | 'info'

export interface INotification {
    id: number
    message: string
    type: TNotificationType
}

export interface INotificationContextType {
    notify: {
        success: (msg: string) => void
        error: (msg: string) => void
        info: (msg: string) => void
    }
}

export interface ConfirmOptions {
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'info'
}

export interface ConfirmationContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>
}