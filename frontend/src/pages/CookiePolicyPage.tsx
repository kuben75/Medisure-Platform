import Navbar from '../components/layout/Navbar.tsx';

export default function CookiePolicyPage() {
    return (
        <>
            <Navbar/>
            <div className="min-h-screen bg-slate-50 py-12 md:py-24 px-4">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-3xl shadow-xl border border-gray-100">

                    <div className="border-b border-gray-200 pb-8 mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Polityka Cookies Medisure.pl
                        </h1>
                        <p className="text-gray-500 italic">
                            Obowiązuje od: 2025 r.
                        </p>
                    </div>

                    <div className="space-y-8 text-gray-700">
                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Czym są pliki cookies?</h3>
                            <p>Pliki cookies to niewielkie pliki tekstowe zapisywane w urządzeniu Użytkownika. Pozwalają
                                m.in. rozpoznać urządzenie, dostosować zawartość i zbierać statystyki.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Jakie pliki cookies stosujemy?</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Cookies niezbędne:</strong> Konieczne do działania serwisu (logowanie,
                                    sesje, bezpieczeństwo).
                                </li>
                                <li><strong>Cookies funkcjonalne:</strong> Zapamiętywanie preferencji i personalizacja.
                                </li>
                                <li><strong>Cookies analityczne:</strong> Statystyki odwiedzin (Google Analytics).</li>
                                <li><strong>Cookies marketingowe:</strong> Wyświetlanie reklam (tylko za zgodą).</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Podstawy prawne</h3>
                            <p>Art. 173 Prawa telekomunikacyjnego oraz Art. 6 RODO (uzasadniony interes dla niezbędnych,
                                zgoda dla pozostałych).</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">4. Zarządzanie plikami cookies</h3>
                            <p>Użytkownik może w każdej chwili zmienić ustawienia przeglądarki lub wycofać zgodę w
                                ustawieniach naszej strony.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">5. Kontakt</h3>
                            <p>W sprawach cookies: <a href="mailto:kontakt@medisure.pl"
                                                      className="text-blue-600">kontakt@medisure.pl</a>.</p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}