import Navbar from '../components/layout/Navbar.tsx';

export default function PrivacyPolicyPage() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 py-12 md:py-24 px-4">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-3xl shadow-xl border border-gray-100">
                    <div className="border-b border-gray-200 pb-8 mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Polityka Prywatności Medisure.pl
                        </h1>
                        <p className="text-gray-500 italic">
                            Obowiązuje od: 2025 r.
                        </p>
                    </div>

                    <div className="space-y-10 text-gray-700 leading-relaxed">
                        <p>
                            Dokument opisuje zasady przetwarzania danych osobowych przez Medisure Sp. z o.o. podczas korzystania z serwisu <span className="text-[#4E61F6] font-medium">www.medisure.pl</span>, w tym kalkulatora pakietów medycznych, formularzy kontaktowych oraz panelu klienta.
                        </p>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">1</span>
                                Administrator danych osobowych
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <p className="mb-2">Administratorem Twoich danych osobowych jest:</p>
                                <p className="font-semibold text-gray-900">Medisure Sp. z o.o.</p>
                                <p>ul. Grochowska 21, 61-001 Poznań</p>
                                <p>NIP: 2137004852</p>
                                <div className="mt-4 space-y-1">
                                    <p>e-mail: <a href="mailto:kontakt@medisure.pl" className="text-[#4E61F6] hover:underline font-medium">kontakt@medisure.pl</a></p>
                                    <p>telefon: <a href="tel:+48123456789" className="text-[#4E61F6] hover:underline font-medium">+48 123 456 789</a></p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-gray-500">
                                Administrator odpowiada za zgodne z prawem przetwarzanie Twoich danych osobowych oraz zapewnienie ich bezpieczeństwa.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">2</span>
                                W jakim celu przetwarzamy Twoje dane?
                            </h3>
                            <p className="mb-4">Przetwarzamy dane osobowe wyłącznie w zakresie koniecznym do prawidłowego świadczenia naszych usług. Cele obejmują:</p>

                            <div className="space-y-6 pl-4 border-l-2 border-blue-100 ml-3">
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">2.1. Realizacja zapytań przez formularz kontaktowy</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-1">
                                        <li>imię, nazwisko, adres e-mail, numer telefonu, temat i treść wiadomości</li>
                                    </ul>
                                    <p className="text-sm"><span className="font-semibold">Cel:</span> udzielenie odpowiedzi na zadane pytanie oraz kontakt zwrotny.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">2.2. Rejestracja i obsługa konta klienta</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-1">
                                        <li>imię i nazwisko, adres e-mail, numer telefonu, hasło (zaszyfrowane), numer PESEL (wprowadzany po rejestracji)</li>
                                    </ul>
                                    <p className="text-sm"><span className="font-semibold">Cel:</span> utworzenie konta, logowanie, obsługa panelu klienta oraz umożliwienie zakupu pakietów medycznych.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">2.3. Wyliczenie przykładowej ceny pakietu w kalkulatorze</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-1">
                                        <li>wiek użytkownika, liczba osób w pakiecie, inne parametry związane z zakresem pakietu</li>
                                    </ul>
                                    <p className="text-sm"><span className="font-semibold">Cel:</span> przedstawienie dopasowanych ofert i orientacyjnej ceny pakietów medycznych.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">2.4. Realizacja procesu zakupu pakietu medycznego</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-1">
                                        <li>imię, nazwisko, numer PESEL, numer telefonu, adres e-mail, dane członków rodziny (pakiety rodzinne)</li>
                                    </ul>
                                    <p className="text-sm"><span className="font-semibold">Cel:</span> przekazanie danych operatorowi medycznemu w celu aktywacji pakietu.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">2.5. Pliki cookies oraz dane statystyczne</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-1">
                                        <li>adres IP, dane o urządzeniu i przeglądarce, aktywność na stronie</li>
                                    </ul>
                                    <p className="text-sm"><span className="font-semibold">Cel:</span> poprawa działania strony, bezpieczeństwo, statystyki oraz marketing.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">3</span>
                                Podstawy prawne przetwarzania
                            </h3>
                            <ul className="space-y-2 list-disc pl-6 marker:text-[#4E61F6]">
                                <li><strong className="text-gray-800">art. 6 ust. 1 lit. b RODO</strong> – niezbędność do realizacji umowy (np. zakup pakietu).</li>
                                <li><strong className="text-gray-800">art. 6 ust. 1 lit. a RODO</strong> – zgoda użytkownika (np. newsletter, dane z formularza).</li>
                                <li><strong className="text-gray-800">art. 6 ust. 1 lit. c RODO</strong> – obowiązki prawne Administratora.</li>
                                <li><strong className="text-gray-800">art. 6 ust. 1 lit. f RODO</strong> – uzasadniony interes Administratora (statystyki, zabezpieczenia).</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">4</span>
                                Komu przekazujemy Twoje dane?
                            </h3>
                            <p className="mb-3">Dane mogą być przekazane wyłącznie podmiotom, bez których świadczenie usług nie byłoby możliwe:</p>
                            <ul className="space-y-1 list-disc pl-6 marker:text-[#4E61F6] mb-4">
                                <li>operatorom medycznym, aby aktywować zakupiony pakiet</li>
                                <li>firmie zapewniającej hosting strony</li>
                                <li>firmie obsługującej system mailowy</li>
                                <li>podmiotom zapewniającym narzędzia analityczne</li>
                                <li>podmiotom IT wspierającym działanie serwisu</li>
                            </ul>
                            <p className="text-sm italic">Nigdy nie sprzedajemy Twoich danych i nie udostępniamy ich podmiotom trzecim w celach niezgodnych z prawem.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">5</span>
                                Jak długo przechowujemy dane?
                            </h3>
                            <ul className="space-y-2 list-disc pl-6 marker:text-[#4E61F6]">
                                <li><span className="font-semibold">dane konta klienta</span> – do czasu usunięcia konta</li>
                                <li><span className="font-semibold">dane do zakupu pakietu</span> – przez okres wymagany przepisami (np. księgowymi)</li>
                                <li><span className="font-semibold">dane z formularza kontaktowego</span> – do 12 miesięcy</li>
                                <li><span className="font-semibold">dane statystyczne</span> – zgodnie z polityką Google Analytics</li>
                                <li><span className="font-semibold">dane dotyczące polubionych ofert</span> – do czasu usunięcia konta lub odwołania zgody</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">6</span>
                                Twoje prawa
                            </h3>
                            <p className="mb-3">Masz prawo do:</p>
                            <div className="grid md:grid-cols-2 gap-2 mb-4">
                                <ul className="list-disc pl-6 marker:text-[#4E61F6]">
                                    <li>dostępu do swoich danych</li>
                                    <li>sprostowania danych</li>
                                    <li>usunięcia danych („prawo do bycia zapomnianym”)</li>
                                    <li>ograniczenia przetwarzania</li>
                                </ul>
                                <ul className="list-disc pl-6 marker:text-[#4E61F6]">
                                    <li>przenoszenia danych</li>
                                    <li>sprzeciwu wobec przetwarzania</li>
                                    <li>odwołania zgody w dowolnym momencie</li>
                                </ul>
                            </div>
                            <p className="bg-blue-50 p-3 rounded-lg text-blue-800 text-center font-medium">
                                Aby skorzystać z praw – napisz na: <a href="mailto:kontakt@medisure.pl" className="underline hover:text-blue-600">kontakt@medisure.pl</a>
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">7</span>
                                Czy podanie danych jest obowiązkowe?
                            </h3>
                            <ul className="space-y-2 list-disc pl-6 marker:text-[#4E61F6]">
                                <li>Podanie maila i hasła jest niezbędne do rejestracji konta.</li>
                                <li>Podanie numeru PESEL jest obowiązkowe wyłącznie przy zakupie pakietu.</li>
                                <li>Formularz kontaktowy wymaga podstawowych danych, byśmy mogli odpowiedzieć.</li>
                                <li>Brak zgody na cookies może ograniczyć część funkcjonalności strony.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">8</span>
                                Bezpieczeństwo danych
                            </h3>
                            <p className="mb-2">Stosujemy zabezpieczenia techniczne i organizacyjne:</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">szyfrowanie SSL</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">zabezpieczenia serwerów</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">szyfrowanie haseł</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">kopie zapasowe</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">Robimy wszystko, by Twoje dane były bezpieczne.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">9</span>
                                Pliki cookies
                            </h3>
                            <p className="mb-2">Na naszej stronie wykorzystujemy cookies:</p>
                            <ul className="list-disc pl-6 mb-3 marker:text-[#4E61F6]">
                                <li>techniczne – niezbędne do działania serwisu</li>
                                <li>analityczne – statystyki, analiza ruchu</li>
                                <li>funkcjonalne – zapamiętywanie preferencji</li>
                                <li>marketingowe – tylko za zgodą użytkownika</li>
                            </ul>
                            <p className="text-sm">Możesz w każdej chwili zmienić ustawienia cookies w przeglądarce.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#4E61F6] text-sm font-bold">10</span>
                                Kontakt w sprawach ochrony danych
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <p className="mb-4">Jeśli masz pytania dotyczące danych osobowych, skontaktuj się:</p>
                                <p className="mb-2">📧 e-mail: <a href="mailto:kontakt@medisure.pl" className="text-[#4E61F6] font-bold hover:underline">kontakt@medisure.pl</a></p>
                                <p className="mb-2">📞 telefon: <a href="tel:+48123456789" className="text-[#4E61F6] font-bold hover:underline">+48 123 456 789</a></p>
                                <p>📮 lub pisemnie na adres siedziby.</p>
                            </div>
                        </section>

                        <section className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">11. Postanowienia końcowe</h3>
                            <p className="text-gray-600 text-sm">
                                W przyszłości Polityka Prywatności może być aktualizowana. O zmianach poinformujemy poprzez komunikat na stronie.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}