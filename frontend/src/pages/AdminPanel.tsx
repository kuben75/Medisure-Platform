import { useAuth } from '../context/AuthContext.tsx'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.tsx'
import PackageManagement from "../components/admin/PackageManagement.tsx"
import UserManagement from "../components/admin/UserManagement.tsx";
import {useState} from "react";
import {Dashboard} from "../components/admin/Dashboard.tsx";
import ReviewManagement from "../components/admin/ReviewManagement.tsx";

export default function AdminPanel() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState('dashboard')

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="p-4 md:p-8 bg-slate-100 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">

                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Panel Administratora</h1>
                        <p className="text-gray-600 mt-1">Witaj, {user?.firstName || user?.email}!</p>
                    </div>
                    <Button variant="primary" className="!py-2 !px-3 text-[16px]" onClick={handleLogout}>
                        Wyloguj się
                    </Button>
                </div>

                <div className="border-b border-gray-200 mb-6 overflow-x-auto">
                    <nav className="flex space-x-6 min-w-max" aria-label="Tabs">
                        <TabButton label="Panel Główny" isActive={activeTab === 'dashboard'}
                                   onClick={() => setActiveTab('dashboard')}/>
                        <TabButton label="Pakiety" isActive={activeTab === 'packages'}
                                   onClick={() => setActiveTab('packages')}/>
                        <TabButton label="Użytkownicy" isActive={activeTab === 'users'}
                                   onClick={() => setActiveTab('users')}/>
                        <TabButton label="Moderacja Opinii" isActive={activeTab === 'reviews'}
                                   onClick={() => setActiveTab('reviews')}/>
                    </nav>
                </div>

                <div>
                    {activeTab === 'dashboard' && <Dashboard/>}
                    {activeTab === 'packages' && <PackageManagement/>}
                    {activeTab === 'users' && <UserManagement/>}
                    {activeTab === 'reviews' && <ReviewManagement/>}
                </div>

            </div>
        </div>
    )
}
const TabButton = ({label, isActive, onClick}: { label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`py-3 px-1 font-medium text-lg transition-colors duration-200 ${
            isActive
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
        }`}
    >
        {label}
    </button>
)