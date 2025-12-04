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
                            Obowiązuje od: 2025 r.
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
                            <p>Rejestracja wymaga podania imienia, nazwiska, e-maila, telefonu i hasła. Po zalogowaniu Użytkownik może uzupełnić numer PESEL, który jest wymagany przy zakupie pakietu.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">5. Kalkulator i porównywarka</h3>
                            <p>Wyniki wyliczane w kalkulatorze mają charakter orientacyjny. Ostateczną cenę i warunki określa operator medyczny.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">6. Zakup pakietu</h3>
                            <p>Zakup dokonywany jest za pośrednictwem Serwisu i wymaga wprowadzenia danych osobowych, w tym numeru PESEL. Umowa świadczenia usług zawierana jest pomiędzy Użytkownikiem a operatorem medycznym.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">7. Płatności</h3>
                            <p>Jeżeli oferta wymaga płatności online, Użytkownik może zostać przekierowany na stronę operatora lub partnera płatniczego. Administrator nie przechowuje danych kart płatniczych.</p>
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