import {useNavigate} from "react-router-dom";
import {useAuth} from "./useAuth.ts";
import {useNotification} from "./UseNotification.ts";
import React, {useEffect, useState} from "react";
import {displayApiError} from "../utils/apiErrorHandler.ts";

export const useRegisterPage = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {notify} = useNotification();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate('/', {replace: true});
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            notify.error("Hasła nie są identyczne.");
            return;
        }
        if (!acceptTerms) {
            notify.error("Musisz zaakceptować regulamin.");
            return;
        }
        if (password.length < 8) {
            notify.error("Hasło musi mieć co najmniej 8 znaków.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    confirmPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw data;
            }


            notify.success(data.message || "Konto utworzone! Sprawdź email.");
            navigate('/login');

        } catch (err: any) {
            displayApiError(err, notify);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        firstName,
        setFirstName,
        lastName,
        setLastName,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        acceptTerms,
        setAcceptTerms,
        isLoading,
        handleSubmit
    };
}