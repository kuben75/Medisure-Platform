import { Link, useLocation } from "react-router-dom";
import Button from '../ui/Button.tsx';
import XIcon from "../icons/XIcon.tsx";
import DashboardIcon from "../icons/DashboardIcon.tsx";
import { NAV_LINKS } from "../../constants/ui.ts";
import BroomIcon from "../icons/BroomIcon.tsx";
import BellIcon from "../icons/BellIcon.tsx";

export default function NavbarDrawers({
                                          isNotificationsOpen,
                                          setIsNotificationsOpen,
                                          isMenuOpen,
                                          setIsMenuOpen,
                                          unreadCount,
                                          visibleNotifications,
                                          notifications,
                                          markAsRead,
                                          markAllAsRead,
                                          handleClearRead,
                                          canClear,
                                          user,
                                          navigate,
                                          isAdmin,
                                          handleLogout
                                      }: any) {
    const location = useLocation()


    return (
        <>

            <div className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isNotificationsOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsNotificationsOpen(false)}/>

            <div className={`fixed top-0 right-0 h-screen w-[85vw] md:w-96 bg-white z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isNotificationsOpen ? "translate-x-0" : "translate-x-full"}`}>

                <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-800">Powiadomienia</h3>
                        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        {canClear && (
                            <button onClick={handleClearRead} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors mr-1 group relative" title="Wyczyść przeczytane">
                                <BroomIcon className="w-5 h-5"/>
                            </button>
                        )}
                        <button onClick={() => setIsNotificationsOpen(false)} className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-800 transition-colors shadow-sm hover:shadow-md">
                            <XIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                {unreadCount > 0 && markAllAsRead && (
                    <div className="px-5 py-2 bg-blue-50/50 border-b border-blue-100 flex justify-end">
                        <button onClick={() => markAllAsRead()} className="text-xs font-bold text-[#4E61F6] hover:text-blue-700 transition-colors">Oznacz wszystkie jako przeczytane</button>
                    </div>
                )}

                <div className="flex-grow overflow-y-auto custom-scrollbar p-0">
                    {visibleNotifications && visibleNotifications.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {visibleNotifications.map((notif: any) => (
                                <div key={notif.id} onClick={() => {
                                    if (!notif.isRead && markAsRead) markAsRead(notif.id);
                                    setIsNotificationsOpen(false);
                                    if (isAdmin) navigate(`/admin?tab=notifications&id=${notif.id}`);
                                    else navigate(`/profile?tab=notifications&id=${notif.id}`);
                                }}
                                     className={`p-5 hover:bg-gray-50 transition-all cursor-pointer group relative ${!notif.isRead ? 'bg-blue-50/40' : 'bg-white'}`}>
                                    {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4E61F6]"></div>}
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{notif.title}</h4>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className={`text-xs leading-relaxed ${!notif.isRead ? 'text-gray-800' : 'text-gray-500'}`}>{notif.message}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                <BellIcon hasUnread={false} className="w-6 h-6 text-gray-600"/>
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
                    <Link to={isAdmin ? "/admin?tab=notifications" : "/profile?tab=notifications"} onClick={() => setIsNotificationsOpen(false)} className="text-sm font-bold text-gray-600 hover:text-[#4E61F6] transition-colors flex items-center justify-center gap-2">
                        Przejdź do pełnej historii
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                    </Link>
                </div>
            </div>

            <div className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 lg:hidden ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsMenuOpen(false)}/>

            <div className={`fixed top-0 right-0 h-screen w-[85vw] max-w-sm bg-white z-[70] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl flex flex-col ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="p-5 flex justify-between items-center border-b border-gray-100">
                    <span className="font-bold text-lg text-gray-800">Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>

                <ul className="flex-grow overflow-y-auto py-4 px-2">
                    {NAV_LINKS.map((link) => (
                        <li key={link.label}>
                            <Link to={link.to} onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3.5 rounded-xl mb-1 font-medium transition-all ${location.pathname === link.to ? "bg-blue-50 text-[#4E61F6]" : "text-gray-600 hover:bg-gray-50"}`}>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    {isAdmin && (
                        <li>
                            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 mt-4 border border-gray-100">
                                <DashboardIcon className="w-5 h-5 text-[#4E61F6]"/>
                                Panel Administratora
                            </Link>
                        </li>
                    )}
                </ul>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    {user ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#4E61F6] rounded-full flex items-center justify-center text-white text-xl font-bold">{user.firstName.charAt(0).toUpperCase()}</div>
                                <div>
                                    <p className="text-sm text-gray-500">Zalogowano jako</p>
                                    <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)}><Button variant="primary" className="w-full !py-2.5 !text-sm">Profil</Button></Link>
                                <Button variant="secondary" className="w-full !py-2.5 !text-sm bg-red-100 text-red-600 hover:bg-red-200" onClick={handleLogout}>Wyloguj</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}><Button variant="outline" className="w-full !py-3">Zaloguj się</Button></Link>
                            <Link to="/rejestracja" onClick={() => setIsMenuOpen(false)}><Button variant="primary" className="w-full !py-3">Utwórz konto</Button></Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}