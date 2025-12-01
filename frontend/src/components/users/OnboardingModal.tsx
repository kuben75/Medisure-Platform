import { useState, useEffect } from 'react';
import Modal from '../ui/Modal.tsx';
import Button from '../ui/Button.tsx';
import BirthDatePicker from '../ui/BirthDatePicker.tsx';
import {useAuth} from "../../hooks/useAuth.ts";
import {useNotification} from "../../hooks/UseNotification.ts";

export default function OnboardingModal() {
    const { user, token, updateUser } = useAuth()
    const { notify } = useNotification()

    const [isOpen, setIsOpen] = useState(false)
    const [birthDateStr, setBirthDateStr] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!user) return

        const hasValidDate = user.birthDate && !user.birthDate.startsWith("0001")
        if (hasValidDate) {
            setIsOpen(false)
            return
        }

        const isSkipped = localStorage.getItem(`skip_onboarding_${user.email}`);

        if (!isSkipped) {
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [user])

    const handleSkip = () => {
        setIsOpen(false);
        if (user?.email) {
            localStorage.setItem(`skip_onboarding_${user.email}`, 'true');
        }
    }

    const calculateAge = (dateString: string) => {
        const birth = new Date(dateString)
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleSave = async () => {
        if (!birthDateStr) return

        const age = calculateAge(birthDateStr)
        if (age < 18) {
            notify.error("Musisz mieć ukończone 18 lat.")
            return
        }

        setLoading(true)

        try {
            const safeDate = new Date(birthDateStr)
            safeDate.setHours(12, 0, 0, 0)

            const payload = {
                firstName: user?.firstName,
                lastName: user?.lastName,
                email: user?.email,
                phoneNumber: user?.phoneNumber,
                birthDate: safeDate.toISOString()
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/account/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error("Błąd zapisu")

            const updatedUser = await response.json()

            updateUser(updatedUser);

            notify.success("Dziękujemy! Profil zaktualizowany.")
            setIsOpen(false);

        } catch (err) {
            console.error(err)
            notify.error("Nie udało się zapisać daty.")
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleSkip} className="max-w-md">
            <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                    🎁
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Dokończ konfigurację</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    Podaj datę urodzenia, abyśmy mogli dobrać dla Ciebie najlepsze oferty.
                </p>

                <div className="mb-8 text-left">
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Data urodzenia</label>

                    <BirthDatePicker
                        value={birthDateStr}
                        onChange={setBirthDateStr}
                    />

                    <p className="text-xs text-gray-400 mt-2 ml-1">Wymagane ukończone 18 lat.</p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button variant="primary" onClick={handleSave} disabled={loading || !birthDateStr} className="w-full py-3">
                        {loading ? "Zapisywanie..." : "Zapisz i przejdź dalej"}
                    </Button>
                    <button onClick={handleSkip} className="text-sm text-gray-400 hover:text-gray-600 underline py-2">
                        Pomiń ten krok
                    </button>
                </div>
            </div>
        </Modal>
    )
}