import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth.ts"
import Button from '../ui/Button.tsx'
// Importujemy ikonę Admina
import DashboardIcon from "../icons/DashboardIcon.tsx";
import UserIcon from "../icons/UserIcon.tsx";
import LogoutIcon from "../icons/LogoutIcon.tsx";
import MenuIcon from "../icons/MenuIcon.tsx";
import XIcon from "../icons/XIcon.tsx";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const { user, logout, roles } = useAuth()
    const isAdmin = roles.includes('Admin')

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto'
    }, [isMenuOpen])

    const handleLogout = () => {
        logout()
        setIsMenuOpen(false)
        navigate('/login')
    }

    const navLinks = [
        { to: "/", label: "Strona główna" },
        { to: "/przewodnik-pacjenta", label: "Przewodnik" },
        { to: "/kalkulator", label: "Kalkulator" },
        { to: "/kontakt", label: "Kontakt" },
    ]

    return (
        <>
            <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-white py-5'}`}>
                <nav className="container mx-auto px-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-[#4E61F6] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">M</div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight">Medisure<span className="text-[#4E61F6]">.pl</span>
                        </span>
                    </Link>

                    <ul className="hidden lg:flex items-center gap-2">
                        {navLinks.map((link, index) => (
                            <li
                                key={link.label}
                                className={index === 0 ? "mr-12 xl:mr-16 relative" : ""}
                            >
                                <Link
                                    to={link.to}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 block
                                        ${location.pathname === link.to
                                        ? "bg-blue-50 text-[#4E61F6]"  
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900" 
                                    }`}
                                >
                                    {link.label}
                                </Link>

                                {index === 0 && (
                                    <span className="absolute -right-8 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-300 block"></span>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="hidden lg:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className="p-2.5 mr-2 text-gray-500 bg-gray-50 hover:bg-blue-50 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all border border-transparent hover:border-yellow-100"
                                        title="Panel Administratora"
                                    >
                                        <DashboardIcon className="w-5 h-5" />
                                    </Link>
                                )}

                                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 text-gray-700 hover:text-[#4E61F6] transition-colors group"
                                        title="Twój profil"
                                    >
                                        <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-[#4E61F6] group-hover:bg-[#4E61F6] group-hover:text-white transition-colors">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 leading-none">Witaj,</span>
                                            <span className="text-sm font-bold leading-none">{user.firstName}</span>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:cursor-pointer transition-colors"
                                        title="Wyloguj"
                                    >
                                        <LogoutIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <span className="text-sm font-semibold text-gray-600 hover:text-[#4E61F6] transition-colors cursor-pointer px-3 py-2">
                                        Logowanie
                                    </span>
                                </Link>
                                <Link to="/rejestracja">
                                    <Button variant="primary" className="!py-2 !px-5 !text-sm !rounded-full shadow-none hover:shadow-lg">
                                        Rejestracja
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 text-gray-600 hover:text-[#4E61F6] transition-colors"
                        >
                            <MenuIcon className="w-8 h-8" />
                        </button>
                    </div>
                </nav>
            </header>

            <div className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 lg:hidden ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsMenuOpen(false)}/>

            <div className={`fixed top-0 right-0 h-screen w-[85vw] max-w-sm bg-white z-[70] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl flex flex-col ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="p-5 flex justify-between items-center border-b border-gray-100">
                    <span className="font-bold text-lg text-gray-800">Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <ul className="flex-grow overflow-y-auto py-4 px-2">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <Link to={link.to} onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3.5 rounded-xl mb-1 font-medium transition-all ${
                                location.pathname === link.to
                                    ? "bg-blue-50 text-[#4E61F6]"
                                    : "text-gray-600 hover:bg-gray-50"}`}>
                                {link.label}
                            </Link>
                        </li>
                    ))}

                    {isAdmin && (
                        <li>
                            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 mt-4 border border-gray-100">
                                <DashboardIcon className="w-5 h-5 text-[#4E61F6]" />
                                Panel Administratora
                            </Link>
                        </li>
                    )}
                </ul>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    {user ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#4E61F6] rounded-full flex items-center justify-center text-white text-xl font-bold">
                                    {user.firstName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Zalogowano jako</p>
                                    <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="primary" className="w-full !py-2.5 !text-sm">Profil</Button>
                                </Link>
                                <Button variant="secondary" className="w-full !py-2.5 !text-sm bg-red-100 text-red-600 hover:bg-red-200" onClick={handleLogout}>
                                    Wyloguj
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="outline" className="w-full !py-3">Zaloguj się</Button>
                            </Link>
                            <Link to="/rejestracja" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="primary" className="w-full !py-3">Utwórz konto</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}