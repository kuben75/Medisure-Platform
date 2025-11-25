import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserPlusIcon from "../components/icons/UserPlusIcon.tsx";
import {useNotification} from "../context/NotificationContext.tsx";

export default function RegisterPage() {
    const navigate = useNavigate()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const {notify} = useNotification()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            notify.error("Hasła nie są identyczne.")
            return
        }
        if(!acceptTerms) {
            notify.error("Musisz zaakceptować regulamin i politykę prywatności.")
            return
        }
        if(password.length < 8) {
            notify.error("Hasło musi mieć co najmniej 8 znaków, dużą literę i znak specjalny.")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("https://localhost:44333/api/auth/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    confirmPassword
                }),
            })

            const data = await response.json();

            if (!response.ok) {
                let errorMsg = "Błąd rejestracji."

                if (Array.isArray(data)) errorMsg = data.map((e: any) => e.description).join(" ")
                else if (data.Message) errorMsg = data.Message

                throw new Error(errorMsg)
            }

            notify.success("Rejestracja zakończona sukcesem. Możesz się teraz zalogować.")
            navigate('/login')
        } catch (err: any) {
            notify.error(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 py-12">
            <div className="w-full max-w-lg">
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200">

                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-[#E4E7FE] rounded-full flex items-center justify-center">
                            <UserPlusIcon className="w-8 h-8 text-[#4E61F6]" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Utwórz konto</h2>
                    <p className="text-center text-gray-500 mb-8">Dołącz do nas i znajdź najlepszy pakiet medyczny.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent transition-all"

                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent transition-all"

                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adres email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent transition-all"

                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent transition-all"

                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Powtórz hasło</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent transition-all"

                            />
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-[#4E61F6] text-[#4E61F6]"
                                />
                            </div>
                            <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-900">
                                Akceptuję <a href="#" className="text-[#4E61F6] hover:underline">Regulamin</a> oraz <a
                                href="#" className="text-[#4E61F6] hover:underline">Politykę Prywatności</a>.
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-[#4E61F6] text-white py-3 px-6 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:bg-[#3B4EDC] hover:shadow-xl transform hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-8">
                        Masz już konto?{' '}
                        <Link to="/login" className="font-medium text-[#4E61F6] hover:text-[#3B4EDC] transition-colors">
                            Zaloguj się
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}