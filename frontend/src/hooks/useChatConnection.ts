import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export const useChatConnection = (hubUrl: string, token: string | null, guestId: string | null) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        let isMounted = true
        let finalUrl = hubUrl

        if (!token && guestId) {
            finalUrl += `?anonId=${guestId}`
        }

        const safeToken = token ? token.replace(/^"|"$/g, '') : ''

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(finalUrl, {
                accessTokenFactory: () => safeToken,
                skipNegotiation: false,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build()

        connectionRef.current = newConnection

        const startConnection = async () => {
            try {
                if (!isMounted) return

                await newConnection.start()

                if (isMounted) {
                    console.log("SignalR Connected ✅")
                    setConnection(newConnection)
                } else {
                    await newConnection.stop()
                }
            } catch (err) {
                if (isMounted) {
                    console.error("SignalR Connection Error:", err)
                }
            }
        }

        startConnection();

        return () => {
            isMounted = false;
            const conn = connectionRef.current
            if (conn) {
                console.log("SignalR Cleaning up... 🧹")
                conn.stop().catch(() => {})
                setConnection(null)
            }
        }
    }, [token, guestId, hubUrl]);

    return connection
}