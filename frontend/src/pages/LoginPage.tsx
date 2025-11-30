import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LockIcon from "../components/icons/LockIcon.tsx"

import {useAuth} from "../hooks/useAuth.ts";
import Navbar from "../components/layout/Navbar.tsx";

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, isLoading, error } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const roles = await login(email, password);

        if (roles) {
            if (roles.includes('Admin')) navigate('/admin')

             else navigate('/profile')

        }

    }

    return (
        <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-[#E4E7FE] rounded-full flex items-center justify-center">
                            <LockIcon className="w-8 h-8 text-[#4E61F6]" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Logowanie do panelu</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Adres email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent transition-all"

                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Hasło
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent transition-all"

                            />
                        </div>

                        <div className="text-right text-sm">
                            <a href="#" className="font-medium text-[#4E61F6] hover:text-[#3B4EDC] transition-colors">
                                Nie pamiętasz hasła?
                            </a>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full bg-[#4E61F6] text-white py-3 px-6 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:bg-[#3B4EDC] hover:shadow-xl transform hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-8">
                        Nie masz konta?{' '}
                        <Link to="/rejestracja" className="font-medium text-[#4E61F6] hover:text-[#3B4EDC] transition-colors">
                            Zarejestruj się
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </>
    )
}