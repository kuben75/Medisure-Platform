import { useState, useEffect } from 'react';
import Button from './Button.tsx';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent')
        if (!consent)
            setTimeout(() => setShow(true), 1000)
    }, [])

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true')
        setShow(false)
    }

    if (!show) return null

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-6 z-50 animate-slide-up">
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="text-4xl hidden sm:block">🍪</div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-1">Używamy plików cookies</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Nasza strona wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania, personalizacji treści oraz prowadzenia statystyk. Możesz zaakceptować wszystkie cookies albo wybrać tylko te niezbędne.
                            Szczegóły znajdziesz w  <a href="/polityka-prywatnosci" className="text-[#4E61F6] underline hover:text-blue-700">Polityce Prywatności</a>.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 flex-shrink-0 w-full md:w-auto">
                    <button
                        onClick={() => setShow(false)}
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-gray-300 !text-base text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                        Zamknij
                    </button>

                    <Button variant="primary" className="flex-1 md:flex-none !px-4 !py-2 shadow-lg !text-base" onClick={handleAccept}>
                        Akceptuję
                    </Button>
                </div>
            </div>
        </div>
    )
}