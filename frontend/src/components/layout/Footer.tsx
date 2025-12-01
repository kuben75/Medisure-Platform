import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-[#D9DFFB]">
            <div className="container mx-auto py-12 px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-700">

                <div>
                    <h4 className="font-bold mb-3 text-gray-900">Siedziba firmy</h4>
                    <p className="text-sm leading-relaxed text-gray-600">
                        Medisure Sp. z o.o.<br/>
                        ul. Grochowska 21<br/>
                        61-001 Poznań<br/>
                        NIP: 2137004852
                    </p>
                    <a
                        href="tel:+48123456789"
                        className="block mt-3 text-sm font-bold text-[#4E61F6] hover:text-blue-700 transition-colors"
                    >
                        +48 123 456 789
                    </a>
                </div>

                <div>
                    <h4 className="font-bold mb-3 text-gray-900">Pakiety medyczne</h4>
                    <ul className="text-sm space-y-2">
                        <li>
                            <Link to="/kalkulator" className="hover:text-[#4E61F6] hover:underline transition-colors">Indywidualne</Link>
                        </li>
                        <li>
                            <Link to="/kalkulator" className="hover:text-[#4E61F6] hover:underline transition-colors">Rodzinne</Link>
                        </li>
                        <li>
                            <Link to="/kalkulator" className="hover:text-[#4E61F6] hover:underline transition-colors">Senior</Link>
                        </li>
                        <li>
                            <Link to="/kalkulator" className="hover:text-[#4E61F6] hover:underline transition-colors">Dla Firm</Link>
                        </li>
                        <li className="pt-3 mt-1 border-t border-blue-200/60">
                            <Link to="/faq" className="font-bold text-[#4E61F6] hover:text-blue-700 transition-colors flex items-center gap-1">
                                <span>Centrum Pomocy / FAQ</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-3 text-gray-900">Operatorzy medyczni</h4>
                    <ul className="text-sm space-y-2 text-gray-600">
                        <li><span className="cursor-default hover:text-gray-900 transition-colors">Grupa LuxMed</span></li>
                        <li><span className="cursor-default hover:text-gray-900 transition-colors">Medicover</span></li>
                        <li><span className="cursor-default hover:text-gray-900 transition-colors">PZU Zdrowie</span></li>
                        <li><span className="cursor-default hover:text-gray-900 transition-colors">Enel-Med</span></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-3 text-gray-900">Informacje</h4>
                    <ul className="text-sm space-y-2">
                        <li>
                            <Link to="/polityka-prywatnosci" className="hover:text-[#4E61F6] hover:underline transition-colors">
                                Regulamin serwisu
                            </Link>
                        </li>
                        <li>
                            <Link to="/polityka-prywatnosci" className="hover:text-[#4E61F6] hover:underline transition-colors">
                                Polityka Prywatności
                            </Link>
                        </li>
                        <li>
                            <Link to="/kontakt" className="hover:text-[#4E61F6] hover:underline transition-colors">
                                Kontakt z nami
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="bg-[#C8CDFB] text-center text-xs text-gray-600 py-4 px-4 border-t border-[#bbc3f0]">
                <p>
                    Korzystamy z plików cookies, aby poprawić jakość korzystania ze strony.
                    Więcej informacji znajdziesz w naszej <Link to="/polityka-prywatnosci" className="font-bold text-[#4E61F6] hover:underline">Polityce prywatności</Link>.
                </p>
                <p className="mt-1 opacity-60">© {new Date().getFullYear()} Medisure Sp. z o.o. Wszelkie prawa zastrzeżone.</p>
            </div>
        </footer>
    );
}