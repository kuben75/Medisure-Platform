import PhoneIcon from "../../components/icons/PhoneIcon.tsx";
import WhatsAppIcon from "../../components/icons/WhatsAppIcon.tsx";

export default function CallUsComponent() {
    return (
        <section className="py-20 px-4 bg-slate-50 border-t border-gray-200">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Potrzebujesz pomocy doradcy?
                </h2>
                <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
                    Nasi eksperci pomogą Ci dobrać idealny pakiet medyczny dopasowany do Twoich potrzeb i budżetu.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

                    <a href="tel:+48222222222"
                       className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center relative overflow-hidden">

                        <div
                            className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <PhoneIcon className="w-8 h-8"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">Infolinia</h3>
                        <p className="text-2xl font-extrabold text-blue-600 mb-2">+48 222 222 222</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Pn - Pt: 8:00 -
                            18:00</p>
                    </a>

                    <a href="https://wa.me/48222222222" target="_blank" rel="noopener noreferrer"
                       className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center">

                        <div
                            className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <WhatsAppIcon className="w-8 h-8"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">WhatsApp</h3>
                        <p className="text-2xl font-extrabold text-green-600 mb-2">Napisz na czacie</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Śr. czas odp: 5
                            min</p>
                    </a>
                </div>
            </div>
        </section>
    );
}