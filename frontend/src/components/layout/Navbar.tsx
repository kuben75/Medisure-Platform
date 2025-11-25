import UserIcon from "../icons/UserIcon.tsx"
import CartIcon from "../icons/CartIcon.tsx"
import {Link, useLocation} from "react-router-dom"
import {useState} from "react"
import MenuIcon from "../icons/XIcon.tsx"
import XIcon from "../icons/MenuIcon.tsx"
import Button from '../ui/Button.tsx'
import {useAuth} from "../../context/AuthContext.tsx";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const location = useLocation()
    const { user, logout } = useAuth()


    const navLinks = [
        { to: "/", label: "Strona główna" },
        { to: "/przewodnik-pacjenta", label: "Przewodnik pacjenta" },
        { to: "/kalkulator", label: "Kalkulator ubezpieczeń" },
        { to: "/kontakt", label: "Kontakt" },
    ];

    return (
        <>
            <header className="bg-[#3B4EDC] text-white sticky top-0 z-50 shadow-md">
                <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="flex space-x-2 items-center font-bold text-lg">
                        <span>Nazwa Firmy</span>
                    </Link>

                    <ul className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <li key={link.label}>
                                <Link to={link.to} className={`transition-colors hover:text-white ${location.pathname === link.to ? "text-white font-semibold" : "text-blue-200"}`}>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                             <span className="text-sm font-medium text-blue-100">
                                Witaj, {user.firstName}
                             </span>
                                <Link to="/profile" className="hover:text-blue-200 transition-colors"
                                      title="Twój profil">
                                    <UserIcon className="w-8 h-8"/>
                                </Link>
                                <button onClick={logout} className="text-sm text-white hover:underline">
                                    Wyloguj
                                </button>
                                <button className="hover:text-blue-200 transition-colors">
                                    <CartIcon/>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <Button variant="secondary" className="!py-2 !px-4 !text-base shadow-none">
                                        Logowanie
                                    </Button>
                                </Link>
                                <Link to="/rejestracja">
                                    <Button variant="outline"
                                            className="!py-2 !px-4 !text-base shadow-none border-blue-200 hover:bg-blue-200">
                                        Rejestracja
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden lg:hidden">
                        <button onClick={() => setIsMenuOpen(true)}>
                            <XIcon/>
                        </button>
                    </div>
                </nav>
            </header>

            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 md:hidden ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsMenuOpen(false)}
            />

            <div
                className={`fixed top-0 right-0 h-screen w-[70vw] max-w-xs bg-[#3B4EDC] z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex justify-end p-5">
                    <button onClick={() => setIsMenuOpen(false)}>
                        <MenuIcon className="w-7 h-7 text-white"/>
                    </button>
                </div>
                <ul className="flex flex-col p-4">
                    {navLinks.map((link) => (
                        <li key={link.label} className="border-b border-blue-500/30">
                            <Link
                                to={link.to}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block py-5 text-center text-lg transition-colors ${location.pathname === link.to ? "text-white font-bold bg-white/10" : "text-blue-200"}`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li className="flex flex-col justify-center items-center space-y-8 pt-8 mt-4">
                        <button className="button-header"><UserIcon className="w-8 h-8" />Moje konto</button>
                        <button className="button-header"><CartIcon className="w-8 h-8" />Koszyk</button>
                    </li>
                </ul>
            </div>
        </>
    );
}

