import PhoneIcon from "../../components/icons/PhoneIcon.tsx";
import MailIcon from "../../components/icons/MailIcon.tsx";
import WhatsAppIcon from "../../components/icons/WhatsAppIcon.tsx";

export default function CallUsComponent() {
    return (
        <section className="py-20 px-4 bg-white">
            <div className="container mx-auto text-center">
                <h2 className="h2-primary">Zadzwoń do nas</h2>
                <p className="text-lg text-gray-600 mb-12 max-w-lg mx-auto">
                    Jesli wolisz bezpośredni kontakt, jesteśmy do Twojej dyspozycji.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <a href="tel:+48222222222"
                       className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-2 transition all duration-300">
                        <div
                            className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                            <PhoneIcon className="w-8 h-8"/>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Telefon</h3>
                        <p className="text-xl text-gray-600">+48 222 222 222</p>
                    </a>
                    <a href="https://wa.me/48222222222" target="_blank" rel="noopener noreferrer"
                        className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:border-green-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                            <WhatsAppIcon className="w-8 h-8"/>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">WhatsApp</h3>
                        <p className="text-xl text-gray-600">Napisz do nas</p>
                    </a>
                    <a href="mailto:naszafirma@gmail.com" className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:border-gray-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                        <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                            <MailIcon className="w-8 h-8"/>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Email</h3>
                        <p className="text-xl text-gray-600">naszafirma@gmail.com</p>
                    </a>
                </div>
            </div>
        </section>
    )

}