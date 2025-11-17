import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LockIcon from "../components/icons/LockIcon.tsx"
import { useAuth } from '../context/AuthContext.tsx'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, isLoading, error } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const success = await login(email, password)

        if (success) navigate('/admin')

    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <LockIcon className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Logowanie do panelu</h2>

                    <form onSubmit={handleSubmit} className="space-y-6" autoComplete={"off"}>
                        {error && (
                            <div className="error-text" role="alert">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Adres email
                            </label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="text-right text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                Nie pamiętasz hasła?
                            </a>
                        </div>

                        <div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-1 disabled:bg-gray-400"
                            disabled={isLoading}>
                                {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-8">Nie masz konta?{' '}
                        <Link to="/rejestracja" className="font-medium text-blue-600 hover:text-blue-500">
                            Zarejestruj się
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}