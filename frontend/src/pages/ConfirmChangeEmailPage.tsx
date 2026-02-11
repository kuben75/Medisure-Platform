import {useEffect, useState, useRef} from 'react';
import {useSearchParams, Link} from 'react-router-dom';
import Navbar from '../components/layout/Navbar.tsx';
import Button from '../components/ui/Button.tsx';
import {useAuth} from "../hooks/useAuth.ts";

export default function ConfirmChangeEmailPage() {
    const [searchParams] = useSearchParams();
    const {logout} = useAuth();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
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

    return (
        <>
            <Navbar/>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div
                    className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-200 text-center animate-fade-in">

                    {status === 'verifying' && (
                        <>
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E61F6] mx-auto mb-6"></div>
                            <h2 className="text-xl font-bold text-gray-700 mb-2">Weryfikacja...</h2>
                            <p className="text-gray-500 text-sm">Trwa potwierdzanie zmiany adresu email.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <div className="animate-scale-in">
                            <div
                                className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sukces!</h2>
                            <p className="text-gray-600 mb-8">
                                Twój adres e-mail został zaktualizowany.<br/>
                                Ze względów bezpieczeństwa wylogowaliśmy Cię. Zaloguj się używając nowego adresu.
                            </p>
                            <Link to="/login">
                                <Button className="w-full shadow-lg">Zaloguj się ponownie</Button>
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="animate-shake">
                            <div
                                className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✕
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nie udało się</h2>
                            <p className="text-gray-600 mb-2">Wystąpił problem podczas weryfikacji:</p>
                            <div
                                className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-8 border border-red-100">
                                {errorMessage}
                            </div>
                            <Link to="/login">
                                <Button variant="secondary" className="w-full">Wróć do logowania</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}