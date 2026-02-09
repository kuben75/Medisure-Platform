import { Link } from "react-router-dom";
import Button from "../../components/ui/Button.tsx";
import PaperAirplaneIcon from "../../components/icons/PaperAirplaneIcon.tsx";
import ContactMap from "../../components/ui/ContactMap.tsx";
import {useFormSection} from "../../hooks/useFormSection.ts";

export default function FormSection() {
    const  {
        formData, setFormData, errors,
        setErrors, isChecked, setIsChecked,
        isLoading, handleSubmit, getInputClass } = useFormSection()

    return (
        <section id="contact-form" className="py-16 px-4 bg-white">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Napisz do nas</h2>
                    <p className="text-gray-500">Wypełnij formularz, a przygotujemy odpowiedź idealnie dopasowaną do Twoich potrzeb.</p>
                </div>

                <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12 items-start">
                    <div className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <form className="space-y-5" onSubmit={handleSubmit}>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Imię <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.name} onChange={e => {setFormData({...formData, name: e.target.value}); setErrors({...errors, name: false})}} className={getInputClass('name')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nazwisko <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.surname} onChange={e => {setFormData({...formData, surname: e.target.value}); setErrors({...errors, surname: false})}} className={getInputClass('surname')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                    <input type="email" value={formData.email} onChange={e => {setFormData({...formData, email: e.target.value}); setErrors({...errors, email: false})}} className={getInputClass('email')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Telefon <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setFormData({...formData, phone: val});
                                            setErrors({...errors, phone: false})
                                        }}
                                        className={getInputClass('phone')}
                                        maxLength={9}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Temat</label>
                                <select value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none bg-white">
                                    <option>Oferta Indywidualna</option>
                                    <option>Oferta Rodzinna</option>
                                    <option>Oferta dla Firm</option>
                                    <option>Inne</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-bold text-gray-700">Wiadomość</label>
                                    <span className={`text-xs ${formData.message.length >= 1000 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                        {formData.message.length} / 1000
                                    </span>
                                </div>
                                <textarea
                                    rows={4}
                                    maxLength={1000}
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none resize-none"

                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <label htmlFor="agreement" className="flex items-start cursor-pointer group">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="agreement"
                                            type="checkbox"
                                            className={`h-5 w-5 rounded border mt-0.5 cursor-pointer focus:ring-2 transition-colors
                                                ${errors.agreement
                                                ? 'border-red-500 text-red-600 focus:ring-red-200'
                                                : 'border-gray-300 text-[#4E61F6] focus:ring-[#4E61F6]'
                                            }`}
                                            checked={isChecked}
                                            onChange={(e) => {
                                                setIsChecked(e.target.checked);
                                                if (e.target.checked) {
                                                    setErrors(prev => ({...prev, agreement: false}));
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className={`ml-3 text-sm transition-colors ${errors.agreement ? 'text-red-600' : 'text-gray-600 group-hover:text-gray-800'}`}>
                                        Oświadczam, że zapoznałem/am się z <Link to="/polityka-prywatnosci" className={`font-medium hover:underline ${errors.agreement ? 'text-red-700' : 'text-[#4E61F6]'}`}>Polityką Prywatności</Link> i akceptuję zasady przetwarzania danych.
                                    </div>
                                </label>
                                {errors.agreement && (
                                    <p className="text-red-500 text-xs mt-2 ml-8 font-semibold">
                                        Zaznaczenie zgody jest wymagane.
                                    </p>
                                )}
                            </div>

                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isLoading}
                                className="w-full !py-4 text-lg shadow-lg flex items-center justify-center gap-2"
                            >
                                {isLoading ? "Wysyłanie..." : <><PaperAirplaneIcon className="w-5 h-5 -rotate-45"/> Wyślij wiadomość</>}
                            </Button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="flex-grow w-full min-h-[400px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 relative z-0">
                            <ContactMap />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}