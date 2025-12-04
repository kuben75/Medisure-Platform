import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.tsx';
import Button from '../components/ui/Button.tsx';
import { useNotification } from "../hooks/UseNotification.ts";

const KeyIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>);

const API_URL = `${import.meta.env.VITE_API_URL}/auth`

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const { notify } = useNotification()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [pageState, setPageState] = useState<'verifying' | 'valid' | 'invalid' | 'submitting' | 'success'>('verifying')
    const [errorMessage, setErrorMessage] = useState('')

    const token = searchParams.get('token')
    const email = searchParams.get('email')

    useEffect(() => {
        const verifyToken = async () => {
            if (!token || !email) {
                setPageState('invalid')
                setErrorMessage("Link jest niekompletny.")
                return
            }
            try {
                const response = await fetch(`${API_URL}/verify-reset-token?email=${email}&token=${encodeURIComponent(token)}`);

                if (response.ok) {
                    setPageState('valid')
                } else {
                    setPageState('invalid')
                    setErrorMessage("Ten link wygasł lub został już wykorzystany.")
                }
            } catch (e) {
                setPageState('invalid')
                setErrorMessage("Błąd połączenia z serwerem.")
            }
        }

        verifyToken()
    }, [token, email])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            notify.error("Hasła nie są identyczne.")
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            notify.error("Hasło: min. 8 znaków, duża litera, cyfra, znak specjalny.")
            return
        }

        setPageState('submitting')

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    token: token,
                    newPassword: password
                })
            })

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.Message || "Błąd resetowania hasła.")
            }

            setPageState('success')
            notify.success("Hasło zmienione pomyślnie!")

        } catch (err) {
            notify.error(err instanceof Error ? err.message : "Błąd resetowania hasła.")
            setPageState('valid')
        }
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20 pt-32">
                <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-200 text-center">

                    <div className="flex justify-center mb-6">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${pageState === 'invalid' ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-[#4E61F6]'}`}>
                            <KeyIcon className="w-8 h-8" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Resetowanie hasła</h2>

                    {pageState === 'verifying' && (
                        <p className="text-gray-500 animate-pulse">Sprawdzanie ważności linku...</p>
                    )}

                    {pageState === 'invalid' && (
                        <div className="animate-fade-in-up">
                            <p className="text-red-600 font-medium mb-6">{errorMessage}</p>
                            <p className="text-sm text-gray-500 mb-6">
                                Linki resetujące są ważne tylko przez 15 minut i są jednorazowe.
                                Jeśli już zmieniłeś hasło lub minął czas, wygeneruj nowy link.
                            </p>
                            <Link to="/zapomnialem-hasla">
                                <Button variant="outline" className="w-full py-3">Wyślij nowy link</Button>
                            </Link>
                        </div>
                    )}

                    {pageState === 'success' && (
                        <div className="animate-fade-in-up">
                            <div className="bg-green-50 border border-green-100 text-green-800 p-4 rounded-xl mb-6 text-sm font-medium">
                                Twoje hasło zostało pomyślnie zmienione.
                            </div>
                            <Link to="/login">
                                <Button variant="primary" className="w-full py-3 shadow-lg">Zaloguj się nowym hasłem</Button>
                            </Link>
                        </div>
                    )}

                    {(pageState === 'valid' || pageState === 'submitting') && (
                        <form onSubmit={handleSubmit} className="space-y-5 text-left animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nowe hasło</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none"
                                    placeholder="Minimum 8 znaków"
                                    disabled={pageState === 'submitting'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Powtórz hasło</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none"
                                    placeholder="Powtórz hasło"
                                    disabled={pageState === 'submitting'}
                                />
                            </div>
                            <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1">
                                <li>Minimum 8 znaków</li>
                                <li>Wielka litera, cyfra i znak specjalny</li>
                            </ul>

                            <Button
                                type="submit"
                                className="w-full py-3 shadow-lg mt-4"
                                disabled={pageState === 'submitting'}
                            >
                                {pageState === 'submitting' ? 'Zapisywanie...' : 'Zmień hasło'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}