import React, { useState } from 'react';
import Modal from '../ui/Modal.tsx';
import Button from '../ui/Button.tsx';
import { useAuth } from '../../hooks/useAuth.ts';
import { useNotification } from '../../hooks/UseNotification.ts';
import type { ChangePasswordModalProps } from "../../types/auth.types.ts";
import { useNavigate } from 'react-router-dom';

const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12"><path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.801a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const { token, user, logout } = useAuth()
    const { notify } = useNotification()
    const navigate = useNavigate()

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [twoFactorCode, setTwoFactorCode] = useState('')

    // Stan kroku: 'form' (hasła) -> 'auth' (kod 2FA)
    const [step, setStep] = useState<'form' | 'auth'>('form')
    const [isLoading, setIsLoading] = useState(false)

    // Reset stanu przy otwarciu/zamknięciu
    const handleClose = () => {
        setStep('form');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTwoFactorCode('');
        onClose();
    }

    const handleInitialSubmit = (e: React.FormEvent) => {
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

        // Jeśli user ma 2FA -> idź do kroku 2
        if (user?.twoFactorEnabled) {
            setStep('auth');
        } else {
            // Jeśli nie ma 2FA -> wyślij od razu
            submitChangePassword();
        }
    }

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
                const data = await response.json();
                let errorMsg = data.Message || "Błąd zmiany hasła.";
                if (data.errors) {
                    errorMsg = Object.values(data.errors).flat().join(', ');
                }
                throw new Error(errorMsg);
            }

            notify.success("Hasło zmienione. Zaloguj się ponownie.");
            handleClose();

            setTimeout(() => {
                logout();
                navigate('/login');
            }, 1500);

        } catch (err: any) {
            notify.error(err.message);
            // Jeśli błąd to zły kod 2FA, zostań w kroku 'auth', w przeciwnym razie wróć do 'form'
            if (!err.message.includes("2FA")) {

            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">

            {step === 'form' ? (
                // --- WIDOK 1: FORMULARZ HASEŁ ---
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Zmień hasło</h2>
                    <p className="text-sm text-gray-500 mb-6">Pamiętaj, aby po zmianie hasła zalogować się ponownie.</p>

                    <form onSubmit={handleInitialSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Obecne hasło</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nowe hasło</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none"
                            />
                            <ul className="text-[10px] text-gray-400 mt-2 list-disc pl-4 space-y-0.5">
                                <li>Min. 8 znaków, wielka litera, cyfra, znak specjalny</li>
                            </ul>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Powtórz nowe hasło</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none"
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full py-3" disabled={isLoading}>
                                Zmień hasło
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                // --- WIDOK 2: AUTORYZACJA 2FA ---
                <div className="text-center animate-slide-in-right px-4">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 animate-pulse">
                        <ShieldIcon />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Weryfikacja 2FA</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Twoje konto jest chronione. <br/>Podaj kod z aplikacji Authenticator, aby zatwierdzić zmianę.
                    </p>

                    <input
                        type="text"
                        value={twoFactorCode}
                        onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-center tracking-widest text-2xl font-bold font-mono mb-6"
                        placeholder="000 000"
                        autoFocus
                    />

                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => setStep('form')} className="w-1/3">
                            Wróć
                        </Button>
                        <Button onClick={submitChangePassword} className="w-2/3 bg-amber-600 hover:bg-amber-700 border-amber-600 shadow-lg" disabled={isLoading}>
                            {isLoading ? "Weryfikacja..." : "Zatwierdź"}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    )
}