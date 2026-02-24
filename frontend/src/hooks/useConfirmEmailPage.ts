import {useSearchParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";

export const useConfirmEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState("Link weryfikacyjny jest nieprawidłowy lub wygasł.");

    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current) {
            return;
        }

        const verifyEmail = async () => {
            const userId = searchParams.get('userId');
            const token = searchParams.get('token');

            if (!userId || !token) {
                setStatus('error');
                return;
            }

            try {
                const url = new URL(`${import.meta.env.VITE_API_URL}/auth/confirm-email`);
                url.searchParams.append('userId', userId);
                url.searchParams.append('token', token);

                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                });

                if (response.ok) {
                    setStatus('success');
                }
                else {
                    const data = await response.json().catch(() => ({}));
                    if (data.message) {
                        setErrorMessage(data.message);
                    }

                    setStatus('error');
                }

            } catch (e) {
                setErrorMessage("Wystąpił problem z połączeniem. Spróbuj później.");
                setStatus('error');
            }
        };
        verifyEmail();

        return () => {
            effectRan.current = true;
        };
    }, [searchParams]);
    return {
        status,
        errorMessage
    }
}