import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.tsx';
import Button from '../components/ui/Button.tsx';
import {useAuth} from "../hooks/useAuth.ts";

export default function ConfirmChangeEmailPage() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
    const {logout} = useAuth()
    const effectRan = useRef(false)

    useEffect(() => {
        const verify = async () => {
            const userId = searchParams.get('userId')
            const newEmail = searchParams.get('newEmail')
            const token = searchParams.get('token')

            if (!userId || !token || !newEmail) {
                setStatus('error')
                return
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/confirm-new-email?userId=${userId}&newEmail=${newEmail}&token=${encodeURIComponent(token)}`)

                if (response.ok) {
                    setStatus('success')
                    logout()
                } else {
                    const data = await response.json().catch(() => ({}));
                    console.error("Błąd weryfikacji:", data);
                    setStatus('error')
                }
            } catch (e) {
                console.error("Błąd sieci:", e);
                setStatus('error')
            }
        }

        if (!effectRan.current) {
            verify();
            return () => {
                effectRan.current = true;
            };
        }
    }, [searchParams])

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-200 text-center">
                    {status === 'verifying' && (
                        <>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E61F6] mx-auto mb-6"></div>
                            <p className="text-gray-500">Weryfikacja zmiany adresu email...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Adres e-mail zmieniony!</h2>
                            <p className="text-gray-600 mb-6">Twój adres e-mail został zaktualizowany. Użyj go przy następnym logowaniu.</p>
                            <Link to="/login"><Button className="w-full">Zaloguj się ponownie</Button></Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <h2 className="text-2xl font-bold text-red-600 mb-4">Błąd zmiany</h2>
                            <p className="text-gray-600 mb-6">Link wygasł lub został już wykorzystany. Spróbuj zalogować się nowym mailem, aby sprawdzić czy zmiana zaszła.</p>
                            <Link to="/profile"><Button variant="secondary" className="w-full">Wróć</Button></Link>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}