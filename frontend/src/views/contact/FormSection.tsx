import React, {useState} from "react"
import {Link} from "react-router-dom"
import Button from "../../components/ui/Button.tsx"
import {useNotification} from "../../hooks/UseNotification.ts"
import ContactMap from "../../components/ui/ContactMap.tsx";
import PaperAirplaneIcon from "../../components/icons/PaperAirplaneIcon.tsx";

export default function FormSection() {
    const [isChecked, setIsChecked] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const {notify} = useNotification()

    const [formData, setFormData] = useState({
        name: '', surname: '', email: '', phone: '', topic: 'Oferta Indywidualna', message: ''
    })
    const [errors, setErrors] = useState<Record<string, boolean>>({})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, boolean> = {};
        if (!formData.name) newErrors.name = true;
        if (!formData.surname) newErrors.surname = true;
        if (!formData.email) newErrors.email = true;
        if (!formData.phone) newErrors.phone = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            notify.error("Uzupełnij wymagane pola oznaczone kolorem czerwonym.");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false)
            notify.success("Wiadomość wysłana! Odpowiemy wkrótce.")
            setFormData({name: '', surname: '', email: '', phone: '', topic: 'Oferta Indywidualna', message: ''})
            setIsChecked(false)
            setErrors({})
        }, 1500)
    }
    const inputClass = (field: string) => `w-full px-4 py-3 border rounded-xl focus:outline-none transition-colors ${errors[field] ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent bg-white'}`

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
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Imię <span
                                        className="text-red-500">*</span></label>
                                    <input type="text" value={formData.name} onChange={e => {
                                        setFormData({...formData, name: e.target.value});
                                        setErrors({...errors, name: false})
                                    }} className={inputClass('name')} />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">Pole wymagane</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nazwisko <span
                                        className="text-red-500">*</span></label>
                                    <input type="text" value={formData.surname} onChange={e => {
                                        setFormData({...formData, surname: e.target.value});
                                        setErrors({...errors, surname: false})
                                    }} className={inputClass('surname')} />
                                    {errors.surname && <p className="text-xs text-red-500 mt-1">Pole wymagane</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email <span
                                        className="text-red-500">*</span></label>
                                    <input type="email" value={formData.email} onChange={e => {
                                        setFormData({...formData, email: e.target.value});
                                        setErrors({...errors, email: false})
                                    }} className={inputClass('email')} />
                                    {errors.email && <p className="text-xs text-red-500 mt-1">Pole wymagane</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Telefon <span
                                        className="text-red-500">*</span></label>
                                    <input type="tel" value={formData.phone} onChange={e => {
                                        setFormData({...formData, phone: e.target.value});
                                        setErrors({...errors, phone: false})
                                    }} className={inputClass('phone')} />
                                    {errors.phone && <p className="text-xs text-red-500 mt-1">Pole wymagane</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Temat</label>
                                <select value={formData.topic}
                                        onChange={e => setFormData({...formData, topic: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none bg-white">
                                    <option>Oferta Indywidualna</option>
                                    <option>Oferta Rodzinna</option>
                                    <option>Oferta dla Firm</option>
                                    <option>Inne</option>
                                </select>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="block text-sm font-bold text-gray-700">Wiadomość</label>
                                    <span
                                        className={`text-xs ${formData.message.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {formData.message.length}/500
                                    </span>
                                </div>
                                <textarea
                                    rows={4}
                                    maxLength={500}
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-start cursor-pointer group">
                                    <div className="flex items-center h-5">
                                        <input type="checkbox"
                                               className="h-5 w-5 rounded border-gray-300 text-[#4E61F6] focus:ring-[#4E61F6] mt-0.5 cursor-pointer"
                                               checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}/>
                                    </div>
                                    <div
                                        className="ml-3 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                                        Oświadczam, że zapoznałem/am się z <Link to="/polityka-prywatnosci"
                                                                                 className="text-[#4E61F6] hover:underline font-medium">Polityką
                                        Prywatności</Link>...
                                    </div>
                                </label>
                            </div>

                            <Button variant="primary" type="submit" disabled={!isChecked || isLoading}
                                    className="w-full !py-4 text-lg shadow-lg flex items-center justify-center gap-2">
                                {isLoading ? "Wysyłanie..." : <><PaperAirplaneIcon
                                    className="w-5 h-5 -rotate-45"/> Wyślij wiadomość</>}
                            </Button>
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