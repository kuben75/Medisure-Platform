import { createContext, useContext, useEffect, useState, useRef, useMemo, type ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks/UseNotification";
import type { IChatMessage, IExtendedChatContext, IUserDetail } from "../types/chat.types";

interface IChatContextWithIdentity extends IExtendedChatContext {
    currentChatId: string;
}

const ChatContext = createContext<IChatContextWithIdentity | null>(null);

const getGuestId = () => {
    let id = localStorage.getItem('guest_chat_id')
    if (!id) {
        id = `guest_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('guest_chat_id', id)
    }
    return id
}

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user, token } = useAuth()
    const { notify } = useNotification()

    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [messages, setMessages] = useState<IChatMessage[]>([])
    const [userDetails, setUserDetails] = useState<Record<string, IUserDetail>>({})
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])


    const connectionRef = useRef<signalR.HubConnection | null>(null)
    const isConnecting = useRef(false)

    const BASE_URL = import.meta.env.VITE_API_URL
    const HUB_URL = `${BASE_URL}/chatHub`

    const currentChatId = (user?.email || (!token ? getGuestId() : "")).toLowerCase();

    const unreadCount = useMemo(() => {
        return messages.filter(m => !m.isRead && m.type === "AdminToUser").length;
    }, [messages]);

    const addMessageUnique = (newMsg: IChatMessage) => {
        setMessages(prev => {
            const exists = prev.some(m =>
                m.message === newMsg.message &&
                m.user === newMsg.user &&
                Math.abs(new Date(m.timestamp).getTime() - newMsg.timestamp.getTime()) < 2000
            )
            if (exists) return prev;
            return [...prev, newMsg];
        })
    }

    useEffect(() => {
        setMessages([]);

        let active = true;
        let newConnection: signalR.HubConnection | null = null;

        const initChat = async () => {
            const guestId = !token ? getGuestId() : null;
            const headers: HeadersInit = {};

            if (token) headers['Authorization'] = `Bearer ${token}`;
            else if (guestId) headers['X-Anon-ID'] = guestId;

            try {
                const response = await fetch(`${BASE_URL}/chat/history`, { headers });
                if (response.ok && active) {
                    const data = await response.json();
                    const rawMsgs = data.messages || data;

                    if (data.users) setUserDetails(data.users);
                    if (data.onlineUsers) setOnlineUsers(data.onlineUsers);

                    const parsedMessages = rawMsgs.map((msg: any) => ({
                        id: msg.id,
                        user: msg.sender,
                        message: msg.message,
                        type: (msg.sender === "Admin" || msg.sender === "System") ? "AdminToUser" : "UserToAdmin",
                        targetUserEmail: msg.receiver,
                        timestamp: new Date(msg.timestamp),
                        isRead: msg.isRead
                    }));

                    if (active) setMessages(parsedMessages);
                }
            } catch (err) {
                console.error("Błąd historii:", err);
            }

            if (connectionRef.current) return;
            isConnecting.current = true;

            let finalHubUrl = HUB_URL;
            if (!token && guestId) {
                finalHubUrl += `?anonId=${guestId}`;
            }

            newConnection = new signalR.HubConnectionBuilder()
                .withUrl(finalHubUrl, { accessTokenFactory: () => token || "" })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Warning)
                .build();

            newConnection.on('ReceiveMessage', (sender: string, message: string, type: any, targetEmail?: string) => {
                const newMsg: IChatMessage = {
                    id: Date.now(),
                    user: sender,
                    message,
                    type,
                    targetUserEmail: targetEmail,
                    timestamp: new Date(),
                    isRead: false
                };
                addMessageUnique(newMsg);
            });

            newConnection.on('UserStatusChanged', (email: string, isOnline: boolean) => {
                setOnlineUsers(prev => {
                    const normalized = email.toLowerCase();
                    return isOnline ? [...new Set([...prev, normalized])] : prev.filter(e => e !== normalized);
                });
            });

            try {
                await newConnection.start();
                console.log(`SignalR Connected (${token ? 'User' : 'Guest'})`);
                if (active) {
                    connectionRef.current = newConnection;
                    setConnection(newConnection);
                } else {
                    newConnection.stop();
                }
            } catch (err) {
                console.error('SignalR Error:', err);
            }
            finally {
                isConnecting.current = false;
            }
        };

        initChat();

        return () => {
            active = false;
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
                setConnection(null);
            }
        };
    }, [token, BASE_URL, HUB_URL]);

    const sendMessageToAdmin = async (msg: string) => {
        if (connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await connection.invoke('SendMessageToAdmin', msg);
            } catch (err) {
                console.error(err);
                notify.error("Błąd wysyłania.");
            }
        } else {
            notify.error("Brak połączenia.");
        }
    };

    const sendMessageToUser = async (targetEmail: string, msg: string) => {
        if (connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await connection.invoke('SendMessageToUser', targetEmail, msg)
            } catch (err) {
                console.error(err)
                notify.error("Błąd wysyłania.")
            }
        }
    }

    const markAsRead = async (targetEmail?: string) => {

        setMessages(prev => {
            if (targetEmail) {
                const targetLower = targetEmail.toLowerCase();

                const hasUnread = prev.some(m =>
                    m.type === "UserToAdmin" &&
                    m.user.toLowerCase() === targetLower &&
                    !m.isRead
                );
                if (!hasUnread) return prev;

                return prev.map(m => {
                    if (m.type === "UserToAdmin" && m.user.toLowerCase() === targetLower && !m.isRead) {
                        return { ...m, isRead: true };
                    }
                    return m;
                });
            }

            else {
                const hasUnread = prev.some(m => m.type === "AdminToUser" && !m.isRead);
                if (!hasUnread) return prev;

                return prev.map(m => {
                    if (m.type === "AdminToUser" && !m.isRead) {
                        return { ...m, isRead: true };
                    }
                    return m;
                });
            }
        });

        const guestId = !token ? getGuestId() : null;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };

        if (token) headers['Authorization'] = `Bearer ${token}`;
        else if (guestId) headers['X-Anon-ID'] = guestId;

        try {
            if (targetEmail) {
                await fetch(`${BASE_URL}/chat/mark-read`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ userEmail: targetEmail })
                });
            } else {
                await fetch(`${BASE_URL}/chat/mark-my-read`, {
                    method: 'POST',
                    headers: headers
                });
            }
        } catch (e) {
            console.error("Błąd oznaczania jako przeczytane:", e);
        }
    }

    return (
        <ChatContext.Provider value={{
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
        </ChatContext.Provider>
    )
}

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat error');
    return context;
}