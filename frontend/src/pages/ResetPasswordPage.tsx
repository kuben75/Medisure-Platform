
import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.tsx'
import Button from '../components/ui/Button.tsx'
import { useNotification } from "../hooks/UseNotification.ts"

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { notify } = useNotification()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const token = searchParams.get('token')
    const email = searchParams.get('email')

    useEffect(() => {
        if (!token || !email) {
            notify.error("Nieprawidłowy link resetujący.")
            navigate('/login')
        }
    }, [token, email, navigate, notify])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            notify.error("Hasła nie są identyczne.")
            return;
        }
        if (!token || !email) return

        setLoading(true)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    token: token,
                    newPassword: password
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.Message || "Błąd resetowania hasła.")
            }

            notify.success("Hasło zostało zmienione pomyślnie! Zaloguj się.")
            navigate('/login')

        } catch (err: any) {
            notify.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20 pt-32">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Ustaw nowe hasło</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nowe hasło</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none"
                                placeholder="Minimum 8 znaków"
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
                            />
                        </div>

                        <Button type="submit" className="w-full py-3 shadow-lg" disabled={loading}>
                            {loading ? 'Zapisywanie...' : 'Zmień hasło'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    )
}