import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../hooks/useAuth.ts"
import Navbar from "../components/layout/Navbar.tsx"
import { useNotification } from "../hooks/UseNotification.ts"
import Button from "../components/ui/Button.tsx"
import LockIcon from "../components/icons/LockIcon.tsx"
import KeyIcon from "../components/icons/KeyIcon.tsx";
export default function LoginPage() {
    const navigate = useNavigate()
    const { setAuthSession, user, roles } = useAuth()
    const { notify } = useNotification()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [code2FA, setCode2FA] = useState('')

    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [authEmail, setAuthEmail] = useState('')
    const [lockedError, setLockedError] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            const target = roles.includes('Admin') ? '/admin' : '/';
            navigate(target, { replace: true });
        }
    }, [user, roles, navigate]);

    const handleSuccessTransition = async (targetUrl: string, onComplete: () => void) => {
        setIsSuccess(true);
        setTimeout(() => {
            onComplete();
            navigate(targetUrl);
        }, 1500);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setLockedError(null)

        try {
            const API_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/auth/login`;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (response.ok) {
                if (data.code === "REQUIRES_2FA" || data.Code === "REQUIRES_2FA") {
                    setAuthEmail(email)
                    setStep(2)
                    notify.info("Wprowadź kod z aplikacji uwierzytelniającej.")
                    setIsLoading(false)
                }
                else {
                    const roles = data.roles || data.user?.roles || [];
                    const target = roles.includes('Admin') ? '/admin' : '/';
                    await handleSuccessTransition(target, () => {
                        setAuthSession(data.token, data.user);
                    })
                }
            } else {
                setIsLoading(false);
                if (data.code === "ACCOUNT_LOCKED" || data.Code === "ACCOUNT_LOCKED") {
                    setLockedError(data.message || "Konto zablokowane.");
                    return;
                }
                throw new Error(data.message || "Błąd logowania")
            }
        } catch (err) {
            setIsLoading(false)
            notify.error(err instanceof Error ? err.message : "Błąd sieci.")
        }
    }

    const handle2FAVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code2FA.length !== 6) {
            notify.error("Kod musi mieć 6 cyfr.")
            return
        }
        setIsLoading(true)

        try {
            const API_URL_2FA = `${import.meta.env.VITE_API_URL}/auth/login-2fa`

            const response = await fetch(API_URL_2FA, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: authEmail, code: code2FA })
            })

            const data = await response.json()

            if (response.ok && (data.token || data.Token)) {
                const token = data.token || data.Token
                const user = data.user || data.User

                const roles = user?.roles || user?.Roles || []
                const target = roles?.includes('Admin') ? '/admin' : '/'

                await handleSuccessTransition(target, () => {
                    setAuthSession(token, user);
                })
            } else {
                setIsLoading(false);
                throw new Error(data.message || data.Message || "Niepoprawny kod 2FA.")
            }

        } catch (err) {
            setIsLoading(false);
            notify.error(err instanceof Error ? err.message : "Błąd sieci.");
        }
    }

    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 py-12 pt-24">
                <div className="w-full max-w-md">
                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 relative overflow-hidden">

                        {isLoading && isSuccess && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-100">
                                <div className="h-full bg-[#4E61F6] animate-progress"></div>
                            </div>
                        )}

                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                            {step === 1 ? 'Logowanie do konta' : 'Weryfikacja 2FA'}
                        </h2>

                        {lockedError && (
                            <div className="mt-4 mb-2 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
                                <div className="text-red-500 mt-0.5">
                                    <LockIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-red-800">Dostęp zablokowany</h3>
                                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                                        {lockedError}
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                                <p className="text-center text-gray-500 mb-6">Wpisz swój email i hasło.</p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E61F6]"
                                        disabled={isLoading || isSuccess}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E61F6]"
                                        disabled={isLoading || isSuccess}
                                    />
                                    <p className="text-xs text-right text-[#4E61F6] hover:underline cursor-pointer mt-2" onClick={() => navigate('/zapomnialem-hasla')}>
                                        Zapomniałem hasła
                                    </p>
                                </div>

                                <Button type="submit" className="w-full py-3 text-lg shadow-lg" disabled={isLoading || isSuccess}>
                                    {isLoading ? 'Przetwarzanie...' : 'Zaloguj się'}
                                </Button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handle2FAVerification} className="space-y-6 animate-fade-in">
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#4E61F6]">
                                        <KeyIcon className="w-8 h-8" />
                                    </div>
                                </div>
                                <p className="text-center text-gray-500 mb-6 text-sm leading-relaxed">
                                    Wprowadź 6-cyfrowy kod z aplikacji uwierzytelniającej ({authEmail}).
                                </p>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Kod 2FA</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={code2FA}
                                        onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, ''))} // Tylko cyfry
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E61F6] text-center text-xl tracking-widest font-bold"
                                        disabled={isLoading || isSuccess}
                                    />
                                </div>

                                <Button type="submit" className="w-full py-3 text-lg shadow-lg" disabled={isLoading || isSuccess}>
                                    {isLoading ? 'Weryfikacja...' : 'Potwierdź'}
                                </Button>
                                <p className="text-center text-xs text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setStep(1)}>
                                    Wróć do logowania email
                                </p>
                            </form>
                        )}

                        <p className="text-center text-sm text-gray-600 mt-8 border-t border-gray-100 pt-6">
                            Nie masz konta? <Link to="/rejestracja" className="font-medium text-[#4E61F6] hover:text-[#3B4EDC]">Zarejestruj się</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}