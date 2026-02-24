import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import Navbar from '../components/layout/Navbar.tsx';
import Button from '../components/ui/Button.tsx';
import {useNotification} from "../hooks/UseNotification.ts";
import KeyIcon from "../components/icons/KeyIcon.tsx";
import type {TForgotPasswordPageProps} from "../types/auth.types.ts";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<TForgotPasswordPageProps>('idle');
    const {notify} = useNotification();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email})
            });
            if (response.ok) {
                setStatus('success');
            }
            else {
                throw new Error("Błąd serwera" + response.status);
            }

        } catch (err) {
            setStatus('idle');
            notify.error("Wystąpił błąd połączenia. Spróbuj ponownie później.");
        }
    };
    const maskedEmail = (email: string) => {
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) {
            return email;
        }
        const maskedLocal = localPart[0] + '*'.repeat(localPart.length - 2) + localPart.slice(-1);
        return `${maskedLocal}@${domain}`;
    };

    return (
        <>
            <Navbar/>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20 pt-32">
                <div
                    className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-200 text-center">

                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                            <KeyIcon className="w-8 h-8 text-[#4E61F6]"/>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Reset hasła</h2>

                    {status === 'success' ? (
                        <div className="animate-fade-in-up">
                            <div className="bg-green-50 border border-green-100 text-green-800 p-6 rounded-2xl mb-8">
                                <h4 className="font-bold text-lg mb-2">Sprawdź skrzynkę pocztową!</h4>
                                <p className="text-sm leading-relaxed">
                                    Jeśli konto powiązane z adresem <strong>{maskedEmail(email)}</strong> istnieje,
                                    wysłaliśmy na nie link do zmiany hasła.
                                </p>
                                <p className="text-xs text-green-600 mt-4 font-medium">
                                    Nie widzisz maila? Sprawdź folder SPAM.
                                </p>
                            </div>

                            <Link to="/login">
                                <Button variant="primary" className="w-full py-3 shadow-lg">
                                    Wróć do logowania
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                                Wyślemy ci wiadomość z linkiem do zresetowania hasła na e-mail.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="text-left">
                                    <label htmlFor="email"
                                           className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                                        Adres email
                                    </label>
                                    <input
                                        id="email"
                                        type="email" required
                                        value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none transition-all"
                                        disabled={status === 'loading'}/>
                                </div>

                                <Button type="submit" variant="primary"
                                        className="w-full py-3.5 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                                        disabled={status === 'loading'}>
                                    {status === 'loading' ? 'Wysyłanie...' : 'Wyślij link resetujący'}
                                </Button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <p className="text-sm text-gray-500">
                                    Pamiętasz hasło? <Link to="/login"
                                                           className="font-bold text-[#4E61F6] hover:underline">Zaloguj
                                    się</Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}