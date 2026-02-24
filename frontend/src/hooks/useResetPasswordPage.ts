import {useSearchParams} from "react-router-dom";
import {useNotification} from "./UseNotification.ts";
import React, {useEffect, useState} from "react";
const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export const useResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const {notify} = useNotification();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [pageState, setPageState] = useState<'verifying' | 'valid' | 'invalid' | 'submitting' | 'success'>('verifying');
    const [errorMessage, setErrorMessage] = useState('');

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token || !email) {
                setPageState('invalid');
                setErrorMessage("Link jest niekompletny.");
                return;
            }
            try {
                const response = await fetch(`${API_URL}/verify-reset-token?email=${email}&token=${encodeURIComponent(token)}`);

                if (response.ok) {
                    setPageState('valid');
                }
                else {
                    setPageState('invalid');
                    setErrorMessage("Ten link wygasł lub został już wykorzystany.");
                }
            } catch (e) {
                setPageState('invalid');
                setErrorMessage("Błąd połączenia z serwerem.");
            }
        };

        verifyToken();
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            notify.error("Hasła nie są identyczne.");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            notify.error("Hasło: min. 8 znaków, duża litera, cyfra, znak specjalny.");
            return;
        }

        setPageState('submitting');

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: email,
                    token: token,
                    newPassword: password
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.Message || "Błąd resetowania hasła.");
            }

            setPageState('success');
            notify.success("Hasło zmienione pomyślnie!");

        } catch (err) {
            notify.error(err instanceof Error ? err.message : "Błąd resetowania hasła.");
            setPageState('valid');
        }
    };
    return {
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        pageState,
        errorMessage,
        handleSubmit
    };
}