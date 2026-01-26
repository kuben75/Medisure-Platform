import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth.ts"
import Button from '../ui/Button.tsx'
import DashboardIcon from "../icons/DashboardIcon.tsx";
import UserIcon from "../icons/UserIcon.tsx";
import LogoutIcon from "../icons/LogoutIcon.tsx";
import MenuIcon from "../icons/MenuIcon.tsx";
import XIcon from "../icons/XIcon.tsx";
import { NAV_LINKS } from "../../constants/ui.ts"
import {useUserNotifications} from "../../hooks/useUserNotifications.ts";

const BroomIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
    </svg>
)

const BellIcon = ({ hasUnread }: { hasUnread: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transition-transform duration-300 group-hover:rotate-12 ${hasUnread ? 'text-gray-800' : 'text-gray-600'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
)

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const [lastClearedTime, setLastClearedTime] = useState<number>(0);

    const location = useLocation()
    const navigate = useNavigate()

    const { unreadCount, notifications, markAsRead, markAllAsRead } = useUserNotifications();
    const { user, logout, roles } = useAuth()
    const isAdmin = roles?.includes('Admin')

    useEffect(() => {
        if (user?.email) {
            const storageKey = `cleared_date_${user.email}`;
            const stored = localStorage.getItem(storageKey);

            if (stored)
                setLastClearedTime(parseInt(stored, 10))
             else
                setLastClearedTime(0)

        }
    }, [user])

    const handleClearRead = () => {
        if (!user?.email) return

        const now = Date.now()
        setLastClearedTime(now)

        const storageKey = `cleared_date_${user.email}`
        localStorage.setItem(storageKey, now.toString())
    }

    const visibleNotifications = notifications.filter(notif => {
        if (!notif.isRead) return true

        const notifDate = new Date(notif.createdAt).getTime()
        return notifDate > lastClearedTime
    })

    const canClear = visibleNotifications.some(n => n.isRead);


    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        document.body.style.overflow = (isMenuOpen || isNotificationsOpen) ? 'hidden' : 'auto'
    }, [isMenuOpen, isNotificationsOpen])

    useEffect(() => {
        setIsNotificationsOpen(false);
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout()
        setIsMenuOpen(false)
        navigate('/login')
    }

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
                        {NAV_LINKS.map((link, index) => (
                            <li key={link.label} className={index === 0 ? "mr-8 xl:mr-12 relative" : ""}>
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
                                    <span className="absolute -right-6 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-300 block"></span>
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

                                <div className="flex items-center gap-2 pl-4 border-l border-gray-200">

                                    <button
                                        onClick={() => setIsNotificationsOpen(true)}
                                        className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors group outline-none"
                                        title="Powiadomienia"
                                    >
                                        <BellIcon hasUnread={unreadCount > 0} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 text-gray-700 hover:text-[#4E61F6] transition-colors group ml-2"
                                        title="Twój profil"
                                    >
                                        <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-[#4E61F6] group-hover:bg-[#4E61F6] group-hover:text-white transition-colors">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 leading-none">Witaj,</span>
                                            <span className="text-sm font-bold leading-none max-w-[80px] truncate">{user.firstName}</span>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="p-2 ml-1 text-gray-400 hover:text-red-500 hover:cursor-pointer transition-colors"
                                        title="Wyloguj"
                                    >
                                        <LogoutIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <Button variant="primary" className="!py-2 !px-5 !text-sm !rounded-full shadow-none hover:shadow-lg">
                                        Logowanie
                                    </Button>
                                </Link>
                                <Link to="/rejestracja">
                                    <span className="text-sm font-semibold text-gray-600 hover:text-[#4E61F6] transition-colors cursor-pointer px-3 py-2">
                                        Rejestracja
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="lg:hidden flex items-center gap-4">
                        {user && (
                            <button onClick={() => setIsNotificationsOpen(true)} className="relative p-1">
                                <BellIcon hasUnread={unreadCount > 0} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 text-gray-600 hover:text-[#4E61F6] transition-colors"
                        >
                            <MenuIcon className="w-8 h-8" />
                        </button>
                    </div>
                </nav>
            </header>

            <div
                className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isNotificationsOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsNotificationsOpen(false)}
            />

            <div className={`fixed top-0 right-0 h-screen w-[85vw] md:w-96 bg-white z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isNotificationsOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-800">Powiadomienia</h3>
                        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                        {canClear && (
                            <button
                                onClick={handleClearRead}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors mr-1 group relative"
                                title="Wyczyść przeczytane"
                            >
                                <BroomIcon className="w-5 h-5" />
                                <span className="absolute top-full right-0 mt-1 w-max px-2 py-1 text-[10px] text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Ukryj przeczytane
                                </span>
                            </button>
                        )}

                        <button onClick={() => setIsNotificationsOpen(false)} className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-800 transition-colors shadow-sm hover:shadow-md">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {unreadCount > 0 && markAllAsRead && (
                    <div className="px-5 py-2 bg-blue-50/50 border-b border-blue-100 flex justify-end">
                        <button
                            onClick={() => markAllAsRead()}
                            className="text-xs font-bold text-[#4E61F6] hover:text-blue-700 transition-colors"
                        >
                            Oznacz wszystkie jako przeczytane
                        </button>
                    </div>
                )}

                <div className="flex-grow overflow-y-auto custom-scrollbar p-0">
                    {visibleNotifications && visibleNotifications.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {visibleNotifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => {
                                        if (!notif.isRead && markAsRead) markAsRead(notif.id)

                                        setIsNotificationsOpen(false)

                                        if (isAdmin) {
                                            navigate(`/admin?tab=notifications&id=${notif.id}`)
                                        } else {
                                            navigate(`/profile?tab=notifications&id=${notif.id}`)
                                        }
                                    }}
                                    className={`p-5 hover:bg-gray-50 transition-all cursor-pointer group relative ${!notif.isRead ? 'bg-blue-50/40' : 'bg-white'}`}
                                >
                                    {!notif.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4E61F6]"></div>
                                    )}
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-xs leading-relaxed ${!notif.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {notif.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                <BellIcon hasUnread={false} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-600">Brak powiadomień</p>
                                {notifications.length > visibleNotifications.length ? (
                                    <p className="text-xs mt-1 text-gray-400">Starsze wiadomości są ukryte.</p>
                                ) : (
                                    <p className="text-xs mt-1">Będziemy Cię informować o ważnych zdarzeniach.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                    <Link
                        to={isAdmin ? "/admin?tab=notifications" : "/profile?tab=notifications"}
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-sm font-bold text-gray-600 hover:text-[#4E61F6] transition-colors flex items-center justify-center gap-2"
                    >
                        Przejdź do pełnej historii
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            <div className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 lg:hidden ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsMenuOpen(false)}/>
            <div className={`fixed top-0 right-0 h-screen w-[85vw] max-w-sm bg-white z-[70] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl flex flex-col ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="p-5 flex justify-between items-center border-b border-gray-100">
                    <span className="font-bold text-lg text-gray-800">Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <ul className="flex-grow overflow-y-auto py-4 px-2">
                    {NAV_LINKS.map((link) => (
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