

export default function Footer() {
    return (
        <footer className="bg-[#D9DFFB]">
            <div className="container mx-auto py-12 px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-700">
                <div>
                    <h4 className="font-bold mb-3">Siedziba firmy</h4>
                    <p className="text-sm">Medisure Sp. z o.o<br/>
                        ul. Jana pawła 2<br/>
                        Wadowice<br/>
                        NIP:2137004852</p>
                    <a href="tel:+48123456789" className="block mt-2 text-sm hover:none hover:text-gray-900">+48 123 456
                        789</a>
                </div>
                <div>
                    <h4 className="font-bold mb-3">Pakiety medyczne</h4>
                    <ul className="text-sm space-y-2">
                        <li><a href="#" className="hover:none hover:text-gray-900">Ogólne warunki świadczenia usług
                            grupa LuxMed</a></li>
                        <li><a href="#" className="hover:none hover:text-gray-900">Ogólne warunki świadczenia usług
                            grupa Enel-Med</a></li>
                        <li><a href="#" className="hover:none hover:text-gray-900">FAQ</a></li>
                        <li><a href="#" className="hover:none hover:text-gray-900"> Benefity dla firm</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-3">Operatorzy medyczni</h4>
                    <ul className="text-sm space-y-2">
                        <li><a href="#" className="hover:none hover:text-gray-900">Grupa LuxMed</a></li>
                        <li><a href="#" className="hover:none hover:text-gray-900">Medicover</a></li>
                        <li><a href="#" className="hover:none hover:text-gray-900">PZU Zdrowie</a></li>
                        <li><a href="#" className="hover:none hover:text-gray-900">Enel-Med</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-3">Informacje</h4>
                    <ul className="text-sm space-y-2">
                        <li><a href="#" className="hover:none hover:text-gray-900">Regulamin</a></li>
                        <li><a href="#" className="hover:none hover:text-gray-900">Polityka Prywatności</a></li>
                    </ul>
                </div>
            </div>
            <div className="bg-[#C8CDFB] text-center text-xs text-gray-600 py-3 px-4">
                <p>Korzystamy z plików cookies, aby poprawić jakość korzystania ze strony.  Więcej informacji znajdziesz w naszej Polityce prywatności.</p>
            </div>
        </footer>
    )
}