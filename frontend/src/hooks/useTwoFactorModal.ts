import {useAuth} from "./useAuth.ts";
import {useNotification} from "./UseNotification.ts";
import React, {useEffect, useState} from "react";
import type {ITwoFactorModalProps} from "../types/ui.types.ts";
import {displayApiError} from "../utils/apiErrorHandler.ts";

export const useTwoFactorModal = ({isOpen, onClose}: ITwoFactorModalProps) => {
    const {token} = useAuth();
    const {notify} = useNotification();

    const [step, setStep] = useState<'loading' | 'intro' | 'setup' | 'success' | 'disabled' | 'disable-auth'>('loading');
    const [qrUri, setQrUri] = useState('');
    const [setupKey, setSetupKey] = useState('');
    const [code, setCode] = useState('');

    const [disablePassword, setDisablePassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSetupData();
            setCode('');
            setDisablePassword('');
            setIsLoading(false);
        }
    }, [isOpen]);

    const fetchSetupData = async () => {
        setStep('loading');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/account/2fa/setup`, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!res.ok) {
                throw await res.json();
            }

            const data = await res.json();

            setQrUri(data.authenticatorUri);
            setSetupKey(data.key);
            setStep(data.isEnabled ? 'disabled' : 'intro');
        } catch (e) {
            displayApiError(e, notify);
            onClose();
        }
    };

    const handleEnable = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/account/2fa/enable`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify({code})
            });

            if (!res.ok) {
                throw await res.json();
            }

            setStep('success');
            notify.success("Weryfikacja dwuetapowa włączona!");
        } catch (e) {
            displayApiError(e, notify);
            setCode('');
        }
    };

    const handleDisableSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!disablePassword) {
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/account/2fa/disable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({password: disablePassword})
            });

            if (!res.ok) {
                throw await res.json();
            }


            notify.info("Weryfikacja dwuetapowa została wyłączona.");
            onClose();
        } catch (e) {
            displayApiError(e, notify);
            setDisablePassword('');
        } finally {
            setIsLoading(false);
        }
    };
    return {
        step,
        qrUri,
        setupKey,
        code,
        setCode,
        disablePassword,
        setDisablePassword,
        isLoading,
        handleEnable,
        handleDisableSubmit,
        setStep
    }
}