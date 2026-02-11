import {Link, useLocation} from "react-router-dom";
import Button from '../ui/Button.tsx';
import DashboardIcon from "../icons/DashboardIcon.tsx";
import UserIcon from "../icons/UserIcon.tsx";
import LogoutIcon from "../icons/LogoutIcon.tsx";
import MenuIcon from "../icons/MenuIcon.tsx";
import {NAV_LINKS} from "../../constants/ui.ts";
import BellIcon from "../icons/BellIcon.tsx";
import type {TNavbarHeaderProps} from "../../types/ui.types.ts";

export default function NavbarHeader({
                                         scrolled,
                                         user,
                                         isAdmin,
                                         unreadCount,
                                         setIsNotificationsOpen,
                                         setIsMenuOpen,
                                         handleLogout
                                     }: TNavbarHeaderProps) {
    const location = useLocation();

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-white py-5'}`}>
            <nav className="container mx-auto px-4 flex justify-between items-center">

                <Link to="/" className="flex items-center gap-2 group">
                    <div
                        className="w-10 h-10 bg-[#4E61F6] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">M
                    </div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">Medisure<span
                        className="text-[#4E61F6]">.pl</span></span>
                </Link>

                <ul className="hidden lg:flex items-center gap-2">
                    {NAV_LINKS.map((link, index) => (
                        <li key={link.label} className={index === 0 ? "mr-8 xl:mr-12 relative" : ""}>
                            <Link to={link.to}
                                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 block ${location.pathname === link.to ? "bg-blue-50 text-[#4E61F6]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                                {link.label}
                            </Link>
                            {index === 0 && <span
                                className="absolute -right-6 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-300 block"></span>}
                        </li>
                    ))}
                </ul>

                <div className="hidden lg:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <Link to="/admin"
                                      className="p-2.5 mr-2 text-gray-500 bg-gray-50 hover:bg-blue-50 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all border border-transparent hover:border-yellow-100"
                                      title="Panel Administratora">
                                    <DashboardIcon className="w-5 h-5"/>
                                </Link>
                            )}

                            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                                <button onClick={() => setIsNotificationsOpen(true)}
                                        className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors group outline-none"
                                        title="Powiadomienia">
                                    <BellIcon hasUnread={unreadCount > 0}
                                              className={`w-6 h-6 transition-transform duration-300 group-hover:rotate-12 ${unreadCount > 0 ? 'text-gray-800' : 'text-gray-600'}`}/>
                                    {unreadCount > 0 && (
                                        <span
                                            className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                <Link to="/profile"
                                      className="flex items-center gap-2 text-gray-700 hover:text-[#4E61F6] transition-colors group ml-2"
                                      title="Twój profil">
                                    <div
                                        className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-[#4E61F6] group-hover:bg-[#4E61F6] group-hover:text-white transition-colors">
                                        <UserIcon className="w-5 h-5"/>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 leading-none">Witaj,</span>
                                        <span
                                            className="text-sm font-bold leading-none max-w-[80px] truncate">{user.firstName}</span>
                                    </div>
                                </Link>

                                <button onClick={handleLogout}
                                        className="p-2 ml-1 text-gray-400 hover:text-red-500 hover:cursor-pointer transition-colors"
                                        title="Wyloguj">
                                    <LogoutIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login"><Button variant="primary"
                                                      className="!py-2 !px-5 !text-sm !rounded-full shadow-none hover:shadow-lg">Logowanie</Button></Link>
                            <Link to="/rejestracja"><span
                                className="text-sm font-semibold text-gray-600 hover:text-[#4E61F6] transition-colors cursor-pointer px-3 py-2">Rejestracja</span></Link>
                        </div>
                    )}
                </div>

                <div className="lg:hidden flex items-center gap-4">
                    {user && (
                        <button onClick={() => setIsNotificationsOpen(true)} className="relative p-1">
                            <BellIcon hasUnread={unreadCount > 0}
                                      className={`w-6 h-6 ${unreadCount > 0 ? 'text-gray-800' : 'text-gray-600'}`}/>
                            {unreadCount > 0 && <span
                                className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>}
                        </button>
                    )}
                    <button onClick={() => setIsMenuOpen(true)}
                            className="p-2 text-gray-600 hover:text-[#4E61F6] transition-colors">
                        <MenuIcon className="w-8 h-8"/>
                    </button>
                </div>
            </nav>
        </header>
    );
}