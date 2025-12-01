import React, { useState } from "react"
import { Link } from "react-router-dom"
import Button from "../../components/ui/Button.tsx"
import { useNotification } from "../../hooks/UseNotification.ts"
import ContactMap from "../../components/ui/ContactMap.tsx";
import PaperAirplaneIcon from "../../components/icons/PaperAirplaneIcon.tsx";

export default function FormSection() {
    const [isChecked, setIsChecked] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { notify } = useNotification()

    const [formData, setFormData] = useState({
        name: '', surname: '', email: '', phone: '', topic: 'Oferta Indywidualna', message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        setTimeout(() => {
            setIsLoading(false)
            notify.success("Wiadomość wysłana! Nasz doradca skontaktuje się z Tobą mailowo w ciągu 24h.")
            setFormData({ name: '', surname: '', email: '', phone: '', topic: 'Oferta Indywidualna', message: '' })
            setIsChecked(false)
        }, 1500)
    }

    return (
        <section id="contact-form" className="py-16 px-4 bg-white">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Napisz do nas</h2>
                    <p className="text-gray-500">Wypełnij formularz, a przygotujemy odpowiedź idealnie dopasowaną do
                        Twoich potrzeb.</p>
                </div>

                <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12 items-start">

                    <div className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="name"
                                           className="block text-sm font-bold text-gray-700 mb-1">Imię</label>
                                    <input
                                        type="text" id="name" required
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"

                                    />
                                </div>
                                <div>
                                    <label htmlFor="surname"
                                           className="block text-sm font-bold text-gray-700 mb-1">Nazwisko</label>
                                    <input
                                        type="text" id="surname" required
                                        value={formData.surname}
                                        onChange={e => setFormData({...formData, surname: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"

                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Adres
                                        email</label>
                                    <input
                                        type="email" id="email" required
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"

                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone"
                                           className="block text-sm font-bold text-gray-700 mb-1">Telefon</label>
                                    <input
                                        type="tel" id="phone" required
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"

                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="context" className="block text-sm font-bold text-gray-700 mb-1">Czego
                                    dotyczy pytanie?</label>
                                <div className="relative">
                                    <select
                                        id="context"
                                        value={formData.topic}
                                        onChange={e => setFormData({...formData, topic: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none bg-white appearance-none cursor-pointer"
                                    >
                                        <option value="Oferta Indywidualna">Zakup pakietu - Indywidualny</option>
                                        <option value="Oferta Rodzinna">Zakup pakietu - Rodzinny</option>
                                        <option value="Oferta Senior">Zakup pakietu - Senior</option>
                                        <option value="Oferta dla Firm">Oferta dla Firm (B2B)</option>
                                        <option value="Wsparcie techniczne">Problem techniczny / Logowanie</option>
                                        <option value="Inne">Inne zapytanie</option>
                                    </select>
                                    <div
                                        className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message"
                                       className="block text-sm font-bold text-gray-700 mb-1">Wiadomość <span
                                    className="font-normal text-gray-400">(opcjonalnie)</span></label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors resize-none"

                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <label htmlFor="agreement" className="flex items-start cursor-pointer group">
                                    <div className="flex items-center h-5">
                                        <input id="agreement" type="checkbox"
                                               className="h-5 w-5 rounded border-gray-300 text-[#4E61F6] focus:ring-[#4E61F6] mt-0.5 cursor-pointer"
                                               checked={isChecked}
                                               onChange={(e) => setIsChecked(e.target.checked)}
                                        />
                                    </div>
                                    <div
                                        className="ml-3 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                                        Zgadzam się na przetwarzanie danych w celu kontaktu. Szczegóły w <Link
                                        to="/polityka-prywatnosci" className="font-bold text-[#4E61F6] hover:underline">Polityce
                                        prywatności</Link>.
                                    </div>
                                </label>
                            </div>

                            <Button
                                variant="primary"
                                type="submit"
                                disabled={!isChecked || isLoading}
                                className="w-full !py-4 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 transition-all">
                                {isLoading ? (
                                    "Wysyłanie...") : (
                                    <>
                                        <PaperAirplaneIcon className="w-5 h-5 -rotate-45 mb-1"/>
                                        Wyślij zapytanie
                                    </>
                                )}
                            </Button>

                            <p className="text-center text-xs text-gray-400 mt-4">
                                Odpowiedź otrzymasz na podany adres e-mail. <br/>
                                Średni czas oczekiwania: <strong>do 24h w dni robocze.</strong>
                            </p>
                        </form>
                    </div>

                    <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6">
                            <h3 className="font-bold text-blue-900 mb-2">Odwiedź nas</h3>
                            <p className="text-sm text-blue-800 mb-4">
                                Nasze biuro jest otwarte dla klientów. Zapraszamy na kawę i rozmowę o ubezpieczeniach.
                            </p>
                            <div className="flex items-start gap-3 text-sm text-blue-700 font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span>Pn-Pt: 08:00 - 18:00</span>
                            </div>
                        </div>

                        <div
                            className="flex-grow w-full min-h-[400px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 relative z-0">
                            <ContactMap/>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}