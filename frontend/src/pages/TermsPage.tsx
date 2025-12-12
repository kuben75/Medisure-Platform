import Navbar from '../components/layout/Navbar.tsx'

export default function TermsPage() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 py-12 md:py-24 px-4">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-3xl shadow-xl border border-gray-100">

                    <div className="border-b border-gray-200 pb-8 mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Regulamin Serwisu Medisure.pl
                        </h1>
                        <p className="text-gray-500 italic">
                            Ostatnia aktualizacja: Grudzień 2025 r.
                        </p>
                    </div>

                    <div className="space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
                        <p>
                            Niniejszy Regulamin określa zasady korzystania z serwisu internetowego <strong>www.medisure.pl</strong>, w tym z kalkulatora pakietów medycznych, porównywarki, formularzy kontaktowych oraz panelu klienta. Korzystając z Serwisu, użytkownik akceptuje niniejszy Regulamin.
                        </p>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Definicje</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Serwis</strong> – strona internetowa dostępna pod adresem www.medisure.pl.</li>
                                <li><strong>Administrator / Usługodawca</strong> – Medisure Sp. z o.o., ul. Grochowska 21, 61-001 Poznań, NIP: 2137004852.</li>
                                <li><strong>Użytkownik</strong> – każda osoba korzystająca z Serwisu.</li>
                                <li><strong>Konto Klienta</strong> – indywidualny profil tworzony przez Użytkownika w Serwisie.</li>
                                <li><strong>Operator medyczny</strong> – firma świadcząca pakiety medyczne dostępne w Serwisie.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Postanowienia ogólne</h3>
                            <p>Serwis umożliwia m.in.: przegląd ofert, obliczanie cen, porównywanie pakietów, rejestrację konta oraz zakup pakietu od operatora.</p>
                            <p className="mt-2">Serwis pełni funkcję pośrednika. Administrator nie świadczy usług medycznych – ostatecznej aktywacji pakietu dokonuje operator medyczny.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Korzystanie z Serwisu</h3>
                            <p>Dostęp do treści Serwisu jest bezpłatny. Użytkownik zobowiązany jest korzystać z Serwisu zgodnie z prawem. Administrator może zablokować dostęp do Konta w przypadku naruszenia Regulaminu.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">4. Rejestracja i Konto Klienta</h3>
                            <p>Rejestracja Konta wymaga podania podstawowych danych: imienia, nazwiska, adresu e-mail, numeru telefonu oraz hasła.</p>
                            <p className="mt-2">Uzupełnienie pozostałych danych, takich jak data urodzenia, następuje w modelu <em>progressive profiling</em> (stopniowe uzupełnianie) i jest dobrowolne na etapie posiadania konta, lecz może być wymagane do skorzystania z niektórych funkcji (np. kalkulatora lub zakupu).</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">5. Kalkulator i porównywarka</h3>
                            <p>Wyniki wyliczane w kalkulatorze mają charakter orientacyjny i są dopasowywane na podstawie wieku zadeklarowanego przez Użytkownika. Ostateczną cenę i warunki określa operator medyczny.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">6. Zakup pakietu i weryfikacja</h3>
                            <p>Zakup dokonywany jest za pośrednictwem Serwisu. Na tym etapie podanie <strong>daty urodzenia</strong> (w celu wyliczenia składki) oraz <strong>numeru PESEL</strong> (w celu identyfikacji ubezpieczonego) jest obowiązkowe.</p>
                            <p className="mt-2 text-gray-600 italic">
                                Uwaga: Numer PESEL podany przy pierwszym zakupie zostaje trwale przypisany do Konta Klienta w celu weryfikacji tożsamości i zachowania ciągłości historii ubezpieczenia.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">7. Płatności i Subskrypcje</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Płatność jednorazowa:</strong> Opłacenie pakietu z góry na czas określony (np. rok). Umowa wygasa automatycznie po upływie tego okresu.</li>
                                <li><strong>Płatność miesięczna (Subskrypcja):</strong> Usługa w modelu odnawialnym. Opłata pobierana jest cyklicznie co miesiąc.</li>
                                <li><strong>Anulowanie:</strong> Użytkownik ma prawo anulować odnawianie subskrypcji miesięcznej w dowolnym momencie poprzez Panel Klienta. Ochrona pozostaje aktywna do końca opłaconego okresu rozliczeniowego.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">8. Odpowiedzialność</h3>
                            <p>Administrator dokłada starań, aby informacje były aktualne, ale nie odpowiada za szkody wynikające z błędnych danych podanych przez Użytkownika lub awarii usług zewnętrznych.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">9. Dane osobowe</h3>
                            <p>Zasady przetwarzania danych opisane są w Polityce Prywatności.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">10. Reklamacje</h3>
                            <p>Reklamacje dotyczące działania Serwisu: <a href="mailto:kontakt@medisure.pl" className="text-blue-600">kontakt@medisure.pl</a> (rozpatrzenie do 14 dni). Reklamacje dotyczące pakietów zgłaszać należy do operatora.</p>
                        </section>

                        <section className="border-t pt-6 mt-6">
                            <p className="text-gray-500 text-sm">
                                W sprawach nieuregulowanych obowiązuje prawo polskie. Regulamin wchodzi w życie z dniem opublikowania.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}