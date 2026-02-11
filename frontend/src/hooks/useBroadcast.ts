import {useState} from 'react';
import {useAuth} from './useAuth.ts';
import {useNotification} from './UseNotification.ts';
import {useConfirm} from './UseConfrim.ts';
import type {TNotificationType} from "../types/notifications.types.ts";

export const useBroadcastPanel = () => {
    const {token} = useAuth();
    const {notify} = useNotification();
    const confirm = useConfirm();

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<TNotificationType>('Info');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) {
            return;
        }

        const shouldSend = await confirm({
            title: "Potwierdzenie wysłania ogłoszenia",
            description: "Czy na pewno chcesz wysłać to ogłoszenie do wszystkich użytkowników?",
            confirmText: "Wyślij",
            cancelText: "Anuluj",
            variant: "info"
        });

        if (!shouldSend) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({title, message, type})
            });

            if (res.ok) {
                notify.success("Ogłoszenie zostało wysłane.");
                setTitle('');
                setMessage('');
                setType('Info');
            }
            else {
                const errData = await res.json();
                notify.error(errData.message || "Wystąpił błąd podczas wysyłania.");
            }
        } catch (err) {
            console.error(err);
            notify.error("Błąd sieci.");
        } finally {
            setLoading(false);
        }
    };

    return {
        title, setTitle,
        message, setMessage,
        type, setType,
        loading,
        handleSend
    }
}