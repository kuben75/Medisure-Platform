import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks/UseNotification";
import type {IChatMessage, IExtendedChatContext, IUserDetail} from "../types/chat.types";

const ChatContext = createContext<IExtendedChatContext | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user, token } = useAuth()
    const { notify } = useNotification()

    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [messages, setMessages] = useState<IChatMessage[]>([])
    const [userDetails, setUserDetails] = useState<Record<string, IUserDetail>>({})
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    const connectionRef = useRef<signalR.HubConnection | null>(null)
    const isConnecting = useRef(false)

    const BASE_URL = "https://localhost:44333/api"
    const HUB_URL = "https://localhost:44333/chatHub"

    const addMessageUnique = (newMsg: IChatMessage) => {
        setMessages(prev => {
            const exists = prev.some(m =>
                m.message === newMsg.message &&
                m.user === newMsg.user &&
                Math.abs(new Date(m.timestamp).getTime() - newMsg.timestamp.getTime()) < 1000
            )

            if (exists) return prev;
            return [...prev, newMsg];
        })
    }

    useEffect(() => {
        const fetchHistory = async () => {
            if (!token) { setMessages([]); return; }

            try {
                const response = await fetch(`${BASE_URL}/chat/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();

                    let msgs = [];
                    if (data.messages) {
                        msgs = data.messages;
                        setUserDetails(data.users || {});
                        setOnlineUsers(data.onlineUsers || []);
                    } else {
                        msgs = data;
                    }

                    const parsedMessages = msgs.map((msg: any) => ({
                        id: msg.id,
                        user: msg.sender,
                        message: msg.message,
                        type: msg.sender === "Admin" ? "AdminToUser" : "UserToAdmin",
                        targetUserEmail: msg.receiver,
                        timestamp: new Date(msg.timestamp),
                        isRead: msg.isRead
                    }))
                    setMessages(parsedMessages);
                }
            } catch (err) {
                console.error("Błąd pobierania historii:", err)
            }
        }
        fetchHistory()
    }, [token])

    useEffect(() => {
        if (!token || connectionRef.current || isConnecting.current) return
        isConnecting.current = true

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, { accessTokenFactory: () => token })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build()

        newConnection.on('ReceiveMessage', (sender: string, message: string, type: any, targetEmail?: string) => {
            const newMsg: IChatMessage = {
                user: sender,
                message,
                type,
                targetUserEmail: targetEmail,
                timestamp: new Date(),
                isRead: false
            };
            addMessageUnique(newMsg);

            if (user && sender !== user.email && sender !== "Admin")
                setUnreadCount(prev => prev + 1)

        })

        newConnection.on('UserStatusChanged', (email: string, isOnline: boolean) => {
            setOnlineUsers(prev => {
                const normalized = email.toLowerCase()
                if (isOnline) return [...new Set([...prev, normalized])]
                return prev.filter(e => e !== normalized)
            })
        })

        const start = async () => {
            try {
                await newConnection.start();
                console.log('SignalR Connected');
                connectionRef.current = newConnection;
                setConnection(newConnection);
            } catch (err) {
                console.error('SignalR Error:', err);
            } finally {
                isConnecting.current = false;
            }
        };
        start();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
                setConnection(null);
            }
        };
    }, [token, user?.email]);

    const sendMessageToAdmin = async (msg: string) => {
        if (connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await connection.invoke('SendMessageToAdmin', msg);
            } catch (err) {
                console.error(err);
                notify.error("Nie udało się wysłać wiadomości.");
            }
        } else {
            notify.error("Brak połączenia z czatem.");
        }
    };

    const sendMessageToUser = async (targetEmail: string, msg: string) => {
        if (connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await connection.invoke('SendMessageToUser', targetEmail, msg)
            } catch (err) {
                console.error(err)
                notify.error("Nie udało się wysłać wiadomości.")
            }
        } else {
            notify.error("Brak połączenia.")
        }
    }

    const markAsRead = async (userEmail: string) => {
        setMessages(prev => prev.map(m => {
            if (m.user.toLowerCase() === userEmail.toLowerCase()) {
                return { ...m, isRead: true };
            }
            return m
        }))

        try {
            await fetch(`${BASE_URL}/chat/mark-read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userEmail })
            });
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <ChatContext.Provider value={{ connection, messages, sendMessageToAdmin, sendMessageToUser, unreadCount, onlineUsers, userDetails, markAsRead }}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat error');
    return context;
}