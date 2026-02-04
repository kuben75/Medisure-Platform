import { Link } from 'react-router-dom'
import type {ReactNode} from "react"
import PhoneIcon from "../icons/PhoneIcon.tsx";
import MailIcon from "../icons/MailIcon.tsx";
import MapIcon from "../icons/MapIcon.tsx";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 font-sans">

            <div className="bg-[#F8FAFC] border-b border-gray-200">
                <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Potrzebujesz pomocy w wyborze?</h3>
                        <p className="text-sm text-gray-500">Nasi konsultanci medyczni są do Twojej dyspozycji.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <a href="tel:+48123456789" className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-[#4E61F6] font-bold rounded-full border border-[#4E61F6] hover:bg-[#4E61F6] hover:text-white transition-all shadow-sm active:scale-95 group">
                            <PhoneIcon className={"w-5 h-5"}/> <span className="group-hover:text-white">+48 123 456 789</span>
                        </a>
                        <Link to="/kontakt" className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#4E61F6] text-white font-medium rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95">
                            <MailIcon className={"w-5 h-5"} /> Napisz do nas
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

                    <div className="lg:col-span-4 space-y-5">
                        <Link to="/" className="flex items-center gap-3 group w-fit">
                            <div className="w-10 h-10 bg-[#4E61F6] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                                M
                            </div>
                            <span className="text-xl font-bold text-gray-800 tracking-tight">
                                Medisure<span className="text-[#4E61F6]">.pl</span>
                            </span>
                        </Link>

                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                            Kompleksowa opieka medyczna dla Ciebie i Twojej rodziny.
                            Współpracujemy z najlepszymi placówkami w Polsce.
                        </p>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3 text-sm text-gray-600">
                                <span className="mt-0.5 text-[#4E61F6]"><MapIcon className={"w-5 h-5"} /></span>
                                <div>
                                    <p className="font-bold text-gray-800">Siedziba główna</p>
                                    <p>ul. Grochowska 21, 61-001 Poznań</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 pl-8">
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">NIP: 2137004852</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 lg:col-start-6">
                        <h4 className="text-gray-900 font-bold mb-5 uppercase text-xs tracking-wider flex items-center gap-2">
                            <span className="w-1 h-4 bg-[#4E61F6] rounded-full"></span>
                            Pakiety Medyczne
                        </h4>
                        <ul className="space-y-3">
                            <FooterLink to="/kalkulator?category=Indywidualny">Pakiet Indywidualny</FooterLink>
                            <FooterLink to="/kalkulator?category=Rodzinny">Pakiet Rodzinny</FooterLink>
                            <FooterLink to="/kalkulator?category=Senior">Pakiet Seniorski</FooterLink>
                            <FooterLink to="/kalkulator?category=Biznesowy">Dla Firm i Korporacji</FooterLink>
                            <li className="pt-2">
                                <Link to="/kalkulator" className="text-[#4E61F6] font-bold text-sm hover:underline transition-colors flex items-center gap-1 group">
                                    Porównaj wszystkie
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="text-gray-900 font-bold mb-5 uppercase text-xs tracking-wider flex items-center gap-2">
                            <span className="w-1 h-4 bg-[#4E61F6] rounded-full"></span>
                            Strefa Pacjenta
                        </h4>
                        <ul className="space-y-3">
                            <FooterLink to="/faq">Centrum Pomocy / FAQ</FooterLink>
                            <FooterLink to="/specjalisci">Lista specjalistów</FooterLink>
                            <FooterLink to="/kontakt">Zgłoś problem</FooterLink>
                            <FooterLink to="/regulamin">Regulamin Serwisu</FooterLink>
                            <FooterLink to="/polityka-cookies">Polityka Plików Cookies</FooterLink>
                            <FooterLink to="/polityka-prywatnosci">Polityka Prywatności</FooterLink>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 bg-white">
                <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                    <p>© {new Date().getFullYear()} Medisure Sp. z o.o. Wszelkie prawa zastrzeżone.</p>
                    <div className="flex gap-6">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> SSL Secure</span>
                        <span>Bezpieczne płatności</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

const FooterLink = ({ to, children }: { to: string, children: ReactNode }) => (
    <li>
        <Link
            to={to}
            className="text-sm text-gray-500 hover:text-[#4E61F6] transition-colors duration-200 block py-0.5"
        >
            {children}
        </Link>
    </li>
)