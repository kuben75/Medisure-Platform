export interface INotify {
    error: (msg: string) => void;
    info?: (msg: string) => void;
    success?: (msg: string) => void;
}

export interface IApiError {
    status?: number;
    message?: string;
    Message?: string;
    errorCode?: number;
    ErrorCode?: number;
    errors?: Record<string, string[]>;
}