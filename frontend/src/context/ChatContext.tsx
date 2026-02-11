import {type ReactNode, useCallback, useEffect, useMemo, useState} from 'react';
import * as signalR from '@microsoft/signalr';
import {useAuth} from "../hooks/useAuth";
import {useNotification} from "../hooks/UseNotification";
import {useChatConnection} from "../hooks/useChatConnection";
import type {IChatMessage, IUserDetail} from "../types/chat.types";
import {ChatContext} from "../hooks/useChat.ts";
import {handleApiError} from "../utils/apiErrorHandler.ts";

const getGuestId = () => {
    let id = localStorage.getItem('guest_chat_id');
    if (!id) {
        id = `guest_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('guest_chat_id', id);
    }
    return id;
};

export const ChatProvider = ({children}: { children: ReactNode }) => {
    const {user, token} = useAuth();
    const {notify} = useNotification();

    const guestId = useMemo(() => !token ? getGuestId() : null, [token]);
    const currentChatId = (user?.email || guestId || "").toLowerCase();

    const BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:44333/api";

    const connection = useChatConnection(`${BASE_URL}/chatHub`.replace('/api/api', '/api'), token, guestId);

    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [userDetails, setUserDetails] = useState<Record<string, IUserDetail>>({});
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        if (!connection) {
            return;
        }

        const handleReceiveMessage = (sender: string, message: string, type: string, targetEmail?: string) => {
            const msgType = (type === "AdminToUser" || type === "UserToAdmin")
                ? type
                : "UserToAdmin";

            const newMsg: IChatMessage = {
                id: Date.now(),
                user: sender,
                message,
                type: msgType,
                targetUserEmail: targetEmail,
                timestamp: new Date(),
                isRead: false
            };

            setMessages(prev => {
                const isDuplicate = prev.some(m =>
                    m.user === newMsg.user &&
                    m.message === newMsg.message &&
                    (newMsg.timestamp.getTime() - new Date(m.timestamp).getTime() < 2000)
                );

                if (isDuplicate) {
                    return prev;
                }

                return [...prev, newMsg];
            });
        };

        const handleUserStatus = (email: string, isOnline: boolean) => {
            setOnlineUsers(prev => {
                const normalized = email.toLowerCase();
                return isOnline ? [...new Set([...prev, normalized])] : prev.filter(e => e !== normalized);
            });
        };

        connection.on('ReceiveMessage', handleReceiveMessage);
        connection.on('UserStatusChanged', handleUserStatus);

        return () => {
            connection.off('ReceiveMessage', handleReceiveMessage);
            connection.off('UserStatusChanged', handleUserStatus);
        };
    }, [connection]);

    useEffect(() => {
        const fetchHistory = async () => {
            const headersObj: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            const safeToken = token ? token.replace(/^"|"$/g, '') : null;

            if (safeToken) {
                headersObj['Authorization'] = `Bearer ${safeToken}`;
            }
            else if (guestId) {
                headersObj['X-Anon-ID'] = guestId;
            }

            console.log("Fetching history headers:", headersObj);

            const endpoint = `${BASE_URL.replace(/\/$/, '')}/chat/history`;

            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: headersObj
                });

                if (!response.ok) {
                    throw await response.json();
                }

                const data = await response.json();
                const rawMsgs = Array.isArray(data) ? data : (data.messages || []);

                if (data.users) {
                    setUserDetails(data.users);
                }
                if (data.onlineUsers) {
                    setOnlineUsers(data.onlineUsers);
                }

                const parsedMessages: IChatMessage[] = Array.isArray(rawMsgs) ? rawMsgs.map((msg: any) => {
                    const msgType: "AdminToUser" | "UserToAdmin" =
                        (msg.sender === "Admin" || msg.sender === "System")
                            ? "AdminToUser"
                            : "UserToAdmin";

                    return {
                        id: msg.id,
                        user: msg.sender,
                        message: msg.message,
                        type: msgType,
                        targetUserEmail: msg.receiver,
                        timestamp: new Date(msg.timestamp),
                        isRead: msg.isRead
                    };
                }) : [];

                setMessages(parsedMessages);
            } catch (err: any) {
                console.error("Błąd pobierania historii:", err);
                if (err?.errorCode !== 3001) {
                    handleApiError(err, notify);
                }
            }
        };

        fetchHistory();
    }, [token, guestId, BASE_URL]);

    const sendMessageToAdmin = async (msg: string) => {
        if (connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await connection.invoke('SendMessageToAdmin', msg);
            } catch (err) {
                handleApiError(err, notify);
            }
        }
        else {
            notify.error("Brak połączenia.");
        }
    };

    const sendMessageToUser = async (targetEmail: string, msg: string) => {
        if (connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await connection.invoke('SendMessageToUser', targetEmail, msg);
            } catch (err) {
                handleApiError(err, notify);
            }
        }
    };

    const markAsRead = useCallback(async (targetEmail?: string) => {
        setMessages(prev => prev.map(m => {
            const isTarget = targetEmail
                ? (m.type === "UserToAdmin" && m.user.toLowerCase() === targetEmail.toLowerCase())
                : (m.type === "AdminToUser");

            return (isTarget && !m.isRead) ? {...m, isRead: true} : m;
        }));

        const headers: HeadersInit = {'Content-Type': 'application/json'};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        else if (guestId) {
            headers['X-Anon-ID'] = guestId;
        }

        try {
            const endpoint = targetEmail ? `${BASE_URL}/chat/mark-read` : `${BASE_URL}/chat/mark-my-read`;
            const body = targetEmail ? JSON.stringify({userEmail: targetEmail}) : undefined;

            await fetch(endpoint, {
                method: 'POST',
                headers,
                body
            });
        } catch (e) {
            console.error("Błąd:", e);
        }
    }, [token, guestId, BASE_URL]);

    const unreadCount = useMemo(() => {
        return messages.filter(m => !m.isRead && m.type === "AdminToUser").length;
    }, [messages]);

    return (
        <ChatContext value={{
            connection,
            messages,
            sendMessageToAdmin,
            sendMessageToUser,
            unreadCount,
            onlineUsers,
            userDetails,
            markAsRead,
            currentChatId
        }}>
            {children}
        </ChatContext>
    )
}

