import {useEffect, useState} from "react"
import {useLocation, useNavigate} from 'react-router-dom'
import { useAuth } from "../../hooks/useAuth.ts"
import Button from '../ui/Button.tsx'
import PackageManagement from "./PackageManagement.tsx"
import UserManagement from "./UserManagement.tsx"
import { Dashboard } from "./Dashboard.tsx"
import ReviewManagement from "./ReviewManagement.tsx"
import AdminChatPanel from "./AdminChatPanel.tsx"
import BroadcastPanel from "./BroadcastPanel.tsx"
import NotificationsPanel from "../users/NotificationsPanel.tsx"
import {TABS} from "../../constants/panelOptions.ts";
import LogoutIcon from "../icons/LogoutIcon.tsx";
import MenuIcon from "../icons/MenuIcon.tsx";
import CloseIcon from "../icons/CloseIcon.tsx";

export default function AdminPanel() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');

        if (tabParam && TABS.some(t => t.id === tabParam)) {
            setActiveTab(tabParam);
        }
    }, [location]);
    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId)
        setIsSidebarOpen(false)
        navigate('/admin')
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans">

            <div className="md:hidden bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-30 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <MenuIcon className="w-6 h-6"/>
                    </button>
                    <span className="font-bold text-gray-800 text-lg">Admin Panel</span>
                </div>
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs border border-indigo-200">
                    {user?.firstName ? user.firstName[0] : 'A'}
                </div>
            </div>

            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>

                    <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col animate-slide-in-left">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="font-bold text-gray-800 text-xl">Menu</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-gray-500">
                                <CloseIcon />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-100'
                                            : 'text-gray-600 hover:bg-gray-50 font-medium'
                                    }`}
                                >
                                    <span className="text-lg">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50">
                            <Button variant="secondary" className="w-full justify-center !py-2.5 text-sm" onClick={() => navigate('/')}>
                                Wróć na stronę
                            </Button>
                            <Button variant="primary" className="w-full justify-center !py-2.5 text-sm flex items-center gap-2" onClick={handleLogout}>
                                <LogoutIcon className="w-5 h-5" /> Wyloguj się
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto md:p-8 p-0">

                <div className="bg-white md:rounded-2xl md:shadow-lg md:border border-gray-200 min-h-[calc(100vh-4rem)] md:min-h-0 overflow-hidden">

                    <div className="hidden md:flex flex-col md:flex-row justify-between md:items-center p-6 md:p-8 border-b border-gray-100">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Panel Administratora</h1>
                            <p className="text-gray-500 mt-1">Zalogowany jako: <span className="font-medium text-gray-900">{user?.firstName || user?.email}</span></p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" className="!py-2.5 !px-5 border-gray-300 text-gray-600 hover:bg-gray-50" onClick={() => navigate('/')}>
                                Podgląd strony
                            </Button>
                            <Button variant="primary" className="!py-2.5 !px-5 flex items-center gap-2 shadow-md shadow-blue-500/20" onClick={handleLogout}>
                                <LogoutIcon className="w-5 h-5"/> Wyloguj
                            </Button>
                        </div>
                    </div>

                    <div className="hidden md:block bg-gray-50/50 px-8 border-b border-gray-200">
                        <nav className="flex space-x-1 overflow-x-auto custom-scrollbar" aria-label="Tabs">
                            {TABS.map(tab => (
                                <TabButton
                                    key={tab.id}
                                    label={tab.label}
                                    isActive={activeTab === tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                />
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 md:p-8 bg-white min-h-[500px]">
                        <div className="animate-fade-in">
                            {activeTab === 'dashboard' && <Dashboard/>}
                            {activeTab === 'packages' && <PackageManagement/>}
                            {activeTab === 'users' && <UserManagement/>}
                            {activeTab === 'reviews' && <ReviewManagement/>}
                            {activeTab === 'chat' && <AdminChatPanel />}
                            {activeTab === 'notificationPanel' && <BroadcastPanel />}
                            {activeTab === 'notifications' && <NotificationsPanel />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const TabButton = ({label, isActive, onClick}: { label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`
            relative py-4 px-4 font-medium text-sm transition-all duration-200 border-b-2
            ${isActive
            ? 'border-[#4E61F6] text-[#4E61F6] font-bold bg-white rounded-t-lg'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-t-lg'
        }
        `}
    >
        {label}
    </button>
)