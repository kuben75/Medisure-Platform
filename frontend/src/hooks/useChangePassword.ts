import {type FormEvent, useState} from "react";
import {useAuth} from "./useAuth.ts";
import {useNotification} from "./UseNotification.ts";
import {useNavigate} from "react-router-dom";
import {handleApiError} from "../utils/apiErrorHandler.ts";

export const useChangePassword = (onClose: () => void) => {
    const {token, user, logout} = useAuth();
    const {notify} = useNotification();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [step, setStep] = useState<'form' | 'auth'>('form');
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = () => {
        setStep('form');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTwoFactorCode('');
    };

    const handleInitialSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            notify.error("Nowe hasła muszą być identyczne.");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            notify.error("Hasło nie spełnia wymagań bezpieczeństwa.");
            return;
        }

        if (user?.twoFactorEnabled) {
            setStep('auth');
        }
        else {
            submitChangePassword();
        }
    };

    const submitChangePassword = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/account/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmNewPassword: confirmPassword,
                    twoFactorCode: user?.twoFactorEnabled ? twoFactorCode : null
                })
            });

            if (!response.ok) {
                throw await response.json();
            }

            notify.success("Hasło zmienione. Zaloguj się ponownie.");
            resetForm();
            onClose();

            setTimeout(() => {
                logout();
                navigate('/login');
            }, 1500);

        } catch (err: any) {
            handleApiError(err, notify);

            if (err.ErrorCode === 2004) {
                setTwoFactorCode('');
            }
            else {
                setStep('form');
            }

        } finally {
            setIsLoading(false);
        }
    };

    return {
        form: {
            currentPassword,
            setCurrentPassword,
            newPassword,
            setNewPassword,
            confirmPassword,
            setConfirmPassword,
            twoFactorCode,
            setTwoFactorCode
        },
        step, setStep, isLoading, handleInitialSubmit, submitChangePassword, resetForm
    }
}