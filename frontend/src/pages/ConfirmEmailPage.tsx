import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.tsx';
import Button from '../components/ui/Button.tsx';

export default function ConfirmEmailPage() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

    useEffect(() => {
        const verifyEmail = async () => {
            const userId = searchParams.get('userId')
            const token = searchParams.get('token')

            if (!userId || !token) {
                setStatus('error')
                return
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/confirm-email?userId=${userId}&token=${encodeURIComponent(token)}`, {
                    method: 'GET'
                })
                if (response.ok)
                    setStatus('success')
                 else
                    setStatus('error')

            } catch (e) {
                setStatus('error')
            }
        }

        verifyEmail()
    }, [searchParams])

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-200 text-center">

                    {status === 'verifying' && (
                        <>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E61F6] mx-auto mb-6"></div>
                            <h2 className="text-2xl font-bold text-gray-800">Weryfikacja adresu email...</h2>
                            <p className="text-gray-500 mt-2">Prosimy o chwilę cierpliwości.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
                            <h2 className="text-2xl font-bold text-gray-800">Sukces!</h2>
                            <p className="text-gray-600 mt-4 mb-8">Twój adres e-mail został potwierdzony. Możesz się teraz zalogować i korzystać z pełni możliwości serwisu.</p>
                            <Link to="/login">
                                <Button className="w-full py-3 shadow-lg">Przejdź do logowania</Button>
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✕</div>
                            <h2 className="text-2xl font-bold text-gray-800">Błąd weryfikacji</h2>
                            <p className="text-gray-600 mt-4 mb-8">Link weryfikacyjny jest nieprawidłowy lub wygasł. Spróbuj zalogować się ponownie, aby wysłać nowy link.</p>
                            <Link to="/kontakt">
                                <Button variant="outline" className="w-full py-3">Skontaktuj się z pomocą</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}