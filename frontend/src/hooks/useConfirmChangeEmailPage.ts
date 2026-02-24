import {useSearchParams} from "react-router-dom";
import {useAuth} from "./useAuth.ts";
import {useEffect, useRef, useState} from "react";
import type {TConfirmChangeEmailStatus} from "../types/auth.types.ts";

export const useConfirmChangeEmailPage = () => {
    const [searchParams] = useSearchParams();
    const {logout} = useAuth();

    const [status, setStatus] = useState<TConfirmChangeEmailStatus>('verifying');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current) {
            return;
        }

        const verify = async () => {
            const userId = searchParams.get('userId');
            const newEmail = searchParams.get('newEmail');
            const token = searchParams.get('token');

            if (!userId || !token || !newEmail) {
                setStatus('error');
                setErrorMessage("Nieprawidłowy link weryfikacyjny.");
                return;
            }

            try {
                const url = new URL(`${import.meta.env.VITE_API_URL}/auth/confirm-new-email`);
                url.searchParams.append('userId', userId);
                url.searchParams.append('newEmail', newEmail);
                url.searchParams.append('token', token);

                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                });

                if (response.ok) {
                    setStatus('success');
                    logout();
                }
                else {
                    const data = await response.json().catch(() => ({}));
                    setErrorMessage(data.message || "Link wygasł lub jest nieprawidłowy.");
                    setStatus('error');
                }
            } catch (e) {
                setErrorMessage("Wystąpił błąd połączenia z serwerem.");
                setStatus('error');
            }
        };
        verify();

        return () => {
            effectRan.current = true;
        };
    }, []);
    return {
        status,
        errorMessage
    }
}