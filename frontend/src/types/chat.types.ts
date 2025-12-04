import * as signalR from "@microsoft/signalr";

export interface IChatMessage {
    id?: number;
    user: string;
    message: string;
    type: "UserToAdmin" | "AdminToUser";
    targetUserEmail?: string;
    timestamp: Date;
    isRead?: boolean;
}

export interface IChatContext {
    connection: signalR.HubConnection | null;
    messages: IChatMessage[];
    sendMessageToAdmin: (message: string) => Promise<void>;
    sendMessageToUser: (targetEmail: string, message: string) => Promise<void>;
    unreadCount: number;
    onlineUsers?: string[];
    userDetails?: any;
    markAsRead?: (email: string) => Promise<void>;
}
export interface IUserDetail {
    email: string
    firstName: string
    lastName: string
}

export interface IExtendedChatContext extends IChatContext {
    onlineUsers: string[]
    userDetails: Record<string, IUserDetail>
    markAsRead: (email: string) => Promise<void>
}