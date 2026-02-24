import {useEffect, useState} from 'react';
import {useAuth} from './useAuth.ts';
import {useNotification} from './UseNotification.ts';
import {displayApiError} from "../utils/apiErrorHandler.ts";

export const useOnboardingModal = () => {
    const {user, token, updateUser} = useAuth();
    const {notify} = useNotification();

    const [isOpen, setIsOpen] = useState(false);
    const [birthDateStr, setBirthDateStr] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }

        const hasValidDate = user.birthDate && !user.birthDate.startsWith("0001");
        if (hasValidDate) {
            setIsOpen(false);
            return;
        }

        const isSkipped = localStorage.getItem(`skip_onboarding_${user.email}`);

        if (!isSkipped) {
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleSkip = () => {
        setIsOpen(false);
        if (user?.email) {
            localStorage.setItem(`skip_onboarding_${user.email}`, 'true');
        }

    };

    const calculateAge = (dateString: string) => {
        const birth = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    const handleSave = async () => {
        if (!birthDateStr) {
            return;
        }

        const age = calculateAge(birthDateStr);
        if (age < 18) {
            notify.error("Musisz mieć ukończone 18 lat.");
            return;
        }

        setLoading(true);

        try {
            const safeDate = new Date(birthDateStr);
            safeDate.setHours(12, 0, 0, 0);

            const payload = {
                firstName: user?.firstName,
                lastName: user?.lastName,
                email: user?.email,
                phoneNumber: user?.phoneNumber,
                birthDate: safeDate.toISOString()
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/account/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw await response.json();
            }

            const updatedUser = await response.json();

            updateUser(updatedUser);
            notify.success("Dziękujemy! Profil zaktualizowany.");
            setIsOpen(false);

        } catch (err) {
            displayApiError(err, notify);
        } finally {
            setLoading(false);
        }
    }

    return {
        isOpen, birthDateStr,
        setBirthDateStr, loading,
        handleSkip, handleSave
    }
}