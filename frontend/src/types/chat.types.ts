import * as signalR from "@microsoft/signalr"

export interface IChatMessage {
    id?: number
    user: string
    message: string
    type: "UserToAdmin" | "AdminToUser"
    targetUserEmail?: string
    timestamp: Date
    isRead?: boolean
}
export interface RawMessageDto {
    id: number
    sender: string
    message: string
    receiver: string
    timestamp: string
    isRead: boolean
}
export interface IUserDetail {
    email: string
    firstName: string
    lastName: string
}

export interface IChatContext {
    connection: signalR.HubConnection | null
    messages: IChatMessage[]
    sendMessageToAdmin: (message: string) => Promise<void>
    sendMessageToUser: (targetEmail: string, message: string) => Promise<void>
    unreadCount: number
    onlineUsers: string[]
    userDetails: Record<string, IUserDetail>
    markAsRead: (targetEmail?: string) => Promise<void>
    currentChatId: string
}

export interface IChatBubbleProps {
    message: string
    isMe: boolean
    timestamp: Date
    senderName?: string
    isRead?: boolean
}

export interface IUseAdminConversationsProps {
    messages: IChatMessage[]
    onlineUsers: string[]
    userDetails: any
}

export interface IProps {
    conversations: any[];
    selectedEmail: string | null;
    onSelect: (email: string) => void;
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    filter: 'all' | 'unread' | 'online';
    setFilter: (v: any) => void;
}

export interface IAdminChatWindowProps {
    conversation: any | null;
    onSend: (msg: string) => Promise<void>;
    onBack: () => void;
}