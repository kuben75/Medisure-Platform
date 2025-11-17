import { useState } from "react"
import { Link } from "react-router-dom"
import Button from "../../components/ui/Button.tsx"
import PaperAirplaneIcon from "../../components/icons/PaperAirplaneIcon.tsx"

export default function FormSection() {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <section id="contact-form" className="py-24 px-4 bg-white">
            <div className="container mx-auto">
                <h2 className="h2-primary text-center mb-12">Formularz kontaktowy</h2>

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 bg-white p-8 md:p-12 rounded-2xl shadow-2xl">

                    <form className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
                                <input type="text" id="name"
                                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"/>
                            </div>
                            <div>
                                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
                                <input type="text" id="surname"
                                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adres email</label>
                            <input type="email" id="email"
                                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Numer telefonu</label>
                            <input type="tel" id="phone"
                                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"/>
                        </div>
                        <div>
                            <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">Temat zapytania</label>
                            <select id="context"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors">
                                <option>Zakup pakietu</option>
                                <option>Pytanie o ofertę</option>
                                <option>Inne</option>
                            </select>
                        </div>
                        <div className="pt-4">
                            <label htmlFor="agreement" className="flex items-start">
                                <input id="agreement" type="checkbox"
                                       className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                                       checked={isChecked}
                                       onChange={(e) => setIsChecked(e.target.checked)}
                                />
                                <div className="ml-3 text-sm">
                                    <p className="font-medium text-gray-800">Obowiązek informacyjny</p>
                                    <p className="text-gray-600 mt-1">
                                        Administratorem Twoich danych osobowych jest
                                        Medisure Sp. z o.o. z siedzibą w Poznaniu, 61-001 Poznań, ul. Grochowska 21.
                                        Dane osobowe będą przetwarzane w celu przedstawienia ofert. Szczegółowe
                                        informacje na temat przetwarzania danych są dostępne w
                                        <Link to="/polityka-prywatnosci"
                                              className="font-semibold text-blue-600 hover:underline ml-1">
                                            Polityce prywatności
                                        </Link>.
                                    </p>
                                </div>
                            </label>
                        </div>
                        <Button variant="primary" type="submit" disabled={!isChecked}
                                className="w-full !py-3.5 inline-flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                            <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                            Wyślij wiadomość
                        </Button>
                    </form>

                    <div className="flex flex-col space-y-8">

                        <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg">
                            <img src="src/assets/map.svg" alt="Mapa lokalizacji"
                                 className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}