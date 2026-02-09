import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.tsx';
import Button from '../components/ui/Button.tsx';

export default function ConfirmEmailPage() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
    const [errorMessage, setErrorMessage] = useState("Link weryfikacyjny jest nieprawidłowy lub wygasł.")

    const effectRan = useRef(false)

    useEffect(() => {
        if (effectRan.current) return

        const verifyEmail = async () => {
            const userId = searchParams.get('userId')
            const token = searchParams.get('token')

            if (!userId || !token) {
                setStatus('error')
                return
            }

            try {
                const url = new URL(`${import.meta.env.VITE_API_URL}/auth/confirm-email`)
                url.searchParams.append('userId', userId)
                url.searchParams.append('token', token)

                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })

                if (response.ok) {
                    setStatus('success')
                } else {
                    const data = await response.json().catch(() => ({}))
                    if (data.message)
                        setErrorMessage(data.message)

                    setStatus('error')
                }

            } catch (e) {
                setErrorMessage("Wystąpił problem z połączeniem. Spróbuj później.")
                setStatus('error')
            }
        }
        verifyEmail()

        return () => { effectRan.current = true }
    }, [searchParams])

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-200 text-center animate-fade-in">

                    {status === 'verifying' && (
                        <>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E61F6] mx-auto mb-6"></div>
                            <h2 className="text-2xl font-bold text-gray-800">Weryfikacja adresu email...</h2>
                            <p className="text-gray-500 mt-2">Prosimy o chwilę cierpliwości.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <div className="animate-scale-in">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
                            <h2 className="text-2xl font-bold text-gray-800">Sukces!</h2>
                            <p className="text-gray-600 mt-4 mb-8">Twój adres e-mail został potwierdzony. Możesz się teraz zalogować i korzystać z pełni możliwości serwisu.</p>
                            <Link to="/login">
                                <Button className="w-full py-3 shadow-lg">Przejdź do logowania</Button>
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="animate-shake">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✕</div>
                            <h2 className="text-2xl font-bold text-gray-800">Błąd weryfikacji</h2>

                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mt-4 mb-6 border border-red-100">
                                {errorMessage}
                            </div>

                            <p className="text-gray-500 text-xs mb-8">
                                Spróbuj zalogować się ponownie, aby wysłać nowy link aktywacyjny.
                            </p>

                            <Link to="/kontakt">
                                <Button variant="outline" className="w-full py-3">Skontaktuj się z pomocą</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}