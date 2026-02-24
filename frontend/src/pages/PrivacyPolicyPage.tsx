import Navbar from '../components/layout/Navbar.tsx';

export default function PrivacyPolicyPage() {
    return (
        <>
            <Navbar/>
            <div className="min-h-screen bg-slate-50 py-12 md:py-24 px-4">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-3xl shadow-xl border border-gray-100">
                    <div className="border-b border-gray-200 pb-8 mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Polityka Prywatności Medisure.pl
                        </h1>
                        <p className="text-gray-500 italic">
                            Ostatnia aktualizacja: Grudzień 2025 r.
                        </p>
                    </div>

                    <div className="space-y-10 text-gray-700 leading-relaxed">
                        <p>
                            Dokument opisuje zasady przetwarzania danych osobowych przez Medisure Sp. z o.o. podczas
                            korzystania z serwisu <span className="text-[#4E61F6] font-medium">www.medisure.pl</span>, w
                            tym kalkulatora pakietów medycznych, formularzy kontaktowych oraz panelu klienta.
                        </p>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">1</span>
                                Administrator danych osobowych
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <p className="mb-2">Administratorem Twoich danych osobowych jest:</p>
                                <p className="font-semibold text-gray-900">Medisure Sp. z o.o.</p>
                                <p>ul. Grochowska 21, 61-001 Poznań</p>
                                <p>NIP: 1237004852</p>
                                <div className="mt-4 space-y-1">
                                    <p>e-mail: <a href="mailto:kontakt@medisure.pl"
                                                  className="text-[#4E61F6] hover:underline font-medium">kontakt@medisure.pl</a>
                                    </p>
                                    <p>telefon: <a href="tel:+48123456789"
                                                   className="text-[#4E61F6] hover:underline font-medium">+48 123 456
                                        789</a></p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-gray-500">
                                Administrator odpowiada za zgodne z prawem przetwarzanie Twoich danych osobowych oraz
                                zapewnienie ich bezpieczeństwa.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">2</span>
                                W jakim celu i jakie dane przetwarzamy?
                            </h3>
                            <p className="mb-4">Przetwarzamy dane osobowe wyłącznie w zakresie koniecznym do
                                prawidłowego świadczenia naszych usług. Cele obejmują:</p>

                            <div className="space-y-6 pl-4 border-l-2 border-blue-100 ml-3">
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">2.1. Realizacja zapytań przez formularz
                                        kontaktowy</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-1">
                                        <li>imię, nazwisko, adres e-mail, numer telefonu, temat i treść wiadomości</li>
                                    </ul>
                                    <p className="text-sm"><span className="font-semibold">Cel:</span> udzielenie
                                        odpowiedzi na zadane pytanie oraz kontakt zwrotny.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">2.2. Rejestracja i obsługa konta
                                        klienta</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-1">
                                        <li>imię i nazwisko, adres e-mail, numer telefonu, hasło (zaszyfrowane)</li>
                                        <li><strong>data urodzenia</strong> (opcjonalnie na etapie rejestracji, wymagana
                                            do personalizacji ofert)
                                        </li>
                                    </ul>
                                    <p className="text-sm"><span className="font-semibold">Cel:</span> utworzenie konta,
                                        logowanie, obsługa panelu klienta oraz historia zamówień.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">2.3. Kalkulator i personalizacja
                                        ceny</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-1">
                                        <li>wiek użytkownika (data urodzenia), liczba osób w pakiecie</li>
                                    </ul>
                                    <p className="text-sm"><span className="font-semibold">Cel:</span> automatyczne
                                        wyliczenie wysokości składki ubezpieczeniowej dopasowanej do profilu ryzyka
                                        (wieku).</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">2.4. Zawarcie i realizacja umowy
                                        ubezpieczenia (Zakup)</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-1">
                                        <li><strong>numer PESEL</strong> (wymagany do identyfikacji ubezpieczonego)</li>
                                        <li>imię, nazwisko, adres zamieszkania, numer telefonu, data urodzenia</li>
                                    </ul>
                                    <p className="text-sm"><span className="font-semibold">Cel:</span> wystawienie
                                        polisy ubezpieczeniowej, weryfikacja tożsamości oraz realizacja płatności.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">2.5. Pliki cookies oraz dane
                                        statystyczne</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-1">
                                        <li>adres IP, dane o urządzeniu i przeglądarce, aktywność na stronie</li>
                                    </ul>
                                    <p className="text-sm"><span className="font-semibold">Cel:</span> poprawa działania
                                        strony, bezpieczeństwo, statystyki oraz marketing.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">3</span>
                                Podstawy prawne przetwarzania
                            </h3>
                            <ul className="space-y-2 list-disc pl-6 marker:text-[#4E61F6]">
                                <li><strong className="text-gray-800">art. 6 ust. 1 lit. b RODO</strong> – niezbędność
                                    do wykonania umowy (zakup pakietu, rejestracja konta).
                                </li>
                                <li><strong className="text-gray-800">art. 6 ust. 1 lit. c RODO</strong> – obowiązki
                                    prawne ciążące na Administratorze (np. przepisy podatkowe, ubezpieczeniowe).
                                </li>
                                <li><strong className="text-gray-800">art. 6 ust. 1 lit. a RODO</strong> – zgoda
                                    użytkownika (np. formularz kontaktowy, opcjonalne dane w profilu).
                                </li>
                                <li><strong className="text-gray-800">art. 6 ust. 1 lit. f RODO</strong> – uzasadniony
                                    interes Administratora (dochodzenie roszczeń, statystyki).
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">4</span>
                                Komu przekazujemy Twoje dane?
                            </h3>
                            <p className="mb-3">Dane mogą być przekazane wyłącznie podmiotom, bez których świadczenie
                                usług nie byłoby możliwe:</p>
                            <ul className="space-y-1 list-disc pl-6 marker:text-[#4E61F6] mb-4">
                                <li>operatorom medycznym (w celu aktywacji usług medycznych)</li>
                                <li>operatorom płatności (w celu realizacji transakcji)</li>
                                <li>firmie hostingowej i obsługującej systemy IT</li>
                                <li>kancelariom prawnym i księgowym (w razie konieczności)</li>
                            </ul>
                            <p className="text-sm italic">Nie sprzedajemy Twoich danych podmiotom trzecim w celach
                                marketingowych.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">5</span>
                                Okres przechowywania danych
                            </h3>
                            <ul className="space-y-2 list-disc pl-6 marker:text-[#4E61F6]">
                                <li><span className="font-semibold">Dane konta:</span> do momentu usunięcia konta przez
                                    użytkownika.
                                </li>
                                <li><span
                                    className="font-semibold">Dane transakcyjne i polisy (w tym PESEL):</span> przez
                                    okres wymagany przepisami prawa podatkowego i ubezpieczeniowego (zazwyczaj 5 lat od
                                    końca roku kalendarzowego).
                                </li>
                                <li><span className="font-semibold">Dane kontaktowe:</span> do momentu udzielenia
                                    odpowiedzi lub wniesienia sprzeciwu.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">6</span>
                                Twoje prawa
                            </h3>
                            <p className="mb-3">Zgodnie z RODO przysługuje Ci prawo do:</p>
                            <div className="grid md:grid-cols-2 gap-2 mb-4">
                                <ul className="list-disc pl-6 marker:text-[#4E61F6]">
                                    <li>dostępu do treści swoich danych</li>
                                    <li>sprostowania danych (np. aktualizacji adresu)</li>
                                    <li>usunięcia danych (w zakresie, w jakim nie są wymagane prawem)</li>
                                    <li>ograniczenia przetwarzania</li>
                                </ul>
                                <ul className="list-disc pl-6 marker:text-[#4E61F6]">
                                    <li>przenoszenia danych</li>
                                    <li>wniesienia sprzeciwu</li>
                                    <li>cofnięcia zgody w dowolnym momencie</li>
                                </ul>
                            </div>
                            <p className="bg-blue-50 p-3 rounded-lg text-blue-800 text-center font-medium">
                                Wnioski prosimy kierować na adres: <a href="mailto:kontakt@medisure.pl"
                                                                      className="underline hover:text-blue-600">kontakt@medisure.pl</a>
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">7</span>
                                Dobrowolność podania danych
                            </h3>
                            <ul className="space-y-2 list-disc pl-6 marker:text-[#4E61F6]">
                                <li><strong>Konto:</strong> Podanie adresu e-mail jest dobrowolne, ale niezbędne do
                                    założenia konta.
                                </li>
                                <li><strong>Data urodzenia:</strong> Podanie jest dobrowolne na etapie rejestracji
                                    (można uzupełnić później), ale niezbędne do wyliczenia składki i zakupu polisy.
                                </li>
                                <li><strong>Zakup polisy:</strong> Podanie numeru PESEL oraz pełnych danych adresowych
                                    jest <strong>wymogiem ustawowym i umownym</strong>. Odmowa podania tych danych
                                    uniemożliwia zawarcie umowy ubezpieczenia.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">8</span>
                                Bezpieczeństwo
                            </h3>
                            <p className="mb-2">Stosujemy wysokie standardy bezpieczeństwa:</p>
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">szyfrowanie SSL</span>
                                <span
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">hashowanie haseł (Argon2/BCrypt)</span>
                                <span
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">zabezpieczenia 2FA</span>
                                <span
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">regularne kopie zapasowe</span>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">9</span>
                                Kontakt
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <p className="mb-4">W sprawach dotyczących ochrony danych osobowych:</p>
                                <p className="mb-2">📧 <a href="mailto:kontakt@medisure.pl"
                                                         className="text-[#4E61F6] font-bold hover:underline">kontakt@medisure.pl</a>
                                </p>
                                <p>📮 Medisure Sp. z o.o., ul. Grochowska 21, 61-001 Poznań</p>
                            </div>
                        </section>

                        <section className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">10. Zmiany w polityce</h3>
                            <p className="text-gray-600 text-sm">
                                Polityka jest na bieżąco weryfikowana i aktualizowana w razie potrzeby. Ostatnia
                                modyfikacja: {new Date().toLocaleDateString('pl-PL')}.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}