import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export const useChatConnection = (hubUrl: string, token: string | null, guestId: string | null) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        let finalUrl = hubUrl
        if (!token && guestId) {
            finalUrl += `?anonId=${guestId}`
        }

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(finalUrl, {
                accessTokenFactory: () => token || "",
                skipNegotiation: false,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Error)
            .build();

        connectionRef.current = newConnection;

        const startConnection = async () => {
            try {
                await newConnection.start()
                console.log("SignalR Connected.")
                setConnection(newConnection)
            } catch (err) {
                console.error("SignalR Connection Error:", err)
            }
        }

        startConnection()

        return () => {
            console.log("SignalR Disconnecting...")
            newConnection.stop()
            connectionRef.current = null
            setConnection(null)
        }
    }, [token, guestId, hubUrl])

    return connection
}