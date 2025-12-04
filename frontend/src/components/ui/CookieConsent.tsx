import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button.tsx';

export default function CookieConsent() {
    const [show, setShow] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent')
        if (!consent) {
            setTimeout(() => setShow(true), 1500)
        }
    }, [])

    const handleAcceptAll = () => {
        localStorage.setItem('cookie_consent', 'all')
        setShow(false)
    }

    const handleAcceptEssential = () => {
        localStorage.setItem('cookie_consent', 'essential')
        setShow(false)
    }

    const handleSettings = () => {
        navigate('/polityka-cookies')
    }

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-[100] animate-slide-up">
            <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Używamy plików cookies 🍪</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Nasza strona wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania, personalizacji treści oraz prowadzenia statystyk. Możesz zaakceptować wszystkie cookies albo wybrać tylko te niezbędne.
                        Szczegóły znajdziesz w naszej <Link to="/polityka-cookies" className="text-[#4E61F6] font-medium hover:underline">Polityce Cookies</Link>.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <button
                        onClick={handleSettings}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-sm transition-colors whitespace-nowrap"
                    >
                        Ustawienia cookies
                    </button>

                    <button
                        onClick={handleAcceptEssential}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-sm transition-colors whitespace-nowrap"
                    >
                        Odmów (tylko niezbędne)
                    </button>

                    <Button
                        variant="primary"
                        className="!px-8 !py-2.5 text-sm whitespace-nowrap shadow-lg"
                        onClick={handleAcceptAll}
                    >
                        Akceptuję wszystkie
                    </Button>
                </div>
            </div>
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }`}</style>
        </div>
    )
}