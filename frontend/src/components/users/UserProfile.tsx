import {useEffect, useState, useMemo} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import Button from '../ui/Button.tsx'
import EditProfileModal from "./EditProfileModal.tsx"
import type {IUserSubscription} from "../../types/user.types.ts"
import StarIconOutline from "../icons/StarIconOutline.tsx"
import AddReviewModal from "../ui/AddReviewModal.tsx"
import type {IPricingPlan} from "../../types/pricing.types.ts"
import FavoriteButton from "../ui/FavouriteButton.tsx"
import {useAuth} from "../../hooks/useAuth.ts"
import HeartIcon from "../icons/HeartIcon.tsx";
import EditIcon from "../icons/EditIcon.tsx";
import LockIcon from "../icons/LockIcon.tsx";
import ChangePasswordModal from "./ChangePasswordModal.tsx";
import BriefcaseIcon from "../icons/BriefcaseIcon.tsx";
import SubscriptionDetailsModal from "./SubscriptionDetailsModal.tsx";
import CalendarIcon from "../icons/CalendarIcon.tsx";
import SearchIcon from "../icons/SearchIcon.tsx";
import {SensitiveData} from "../../utils/SensitiveData.tsx";
import NotificationsPanel from "../ui/NotificationsPanel.tsx";
import {useUserNotifications} from "../../hooks/useUserNotifications.ts";
import BellIcon from "../icons/BellIcon.tsx";
import EyeIcon from "../icons/EyeIcon.tsx";
import HealthPrevention from "../ui/HealthPrevention.tsx";
import ShieldIcon from "../icons/ShieldIcon.tsx";
import TwoFactorModal from "./TwoFactorModal.tsx";

const ArrowLeftIcon = ({className = "w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);
export default function UserProfile() {
    const {user, logout, token, roles} = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('subscriptions')
    const [subscriptions, setSubscriptions] = useState<IUserSubscription[]>([])
    const [favorites, setFavorites] = useState<IPricingPlan[]>([])
    const [loading, setLoading] = useState(true)
    const location = useLocation()
    const { unreadCount } = useUserNotifications();

    const [viewingSub, setViewingSub] = useState<IUserSubscription | null>(null)
    const [reviewTarget, setReviewTarget] = useState<{ id: number, name: string } | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)

    const isAdmin = roles?.includes('Admin')
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleCount, setVisibleCount] = useState(3)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }
    const handleOpenDetails = (sub: IUserSubscription) => setViewingSub(sub)
    const handleOpenReview = (pkgId: number, pkgName: string) => {
        setReviewTarget({id: pkgId, name: pkgName})
        setIsReviewModalOpen(true)
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get('tab') === 'notifications' && !isAdmin)
            setActiveTab('notifications')
    }, [location, isAdmin])

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return
            try {
                const subRes = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions`, {headers: {'Authorization': `Bearer ${token}`}});
                if (subRes.ok) setSubscriptions(await subRes.json())

                const favRes = await fetch(`${import.meta.env.VITE_API_URL}/favorites`, {headers: {'Authorization': `Bearer ${token}`}});
                if (favRes.ok) setFavorites(await favRes.json())

            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [token, activeTab])


    const filteredSubscriptions = useMemo(() => {
        return subscriptions
            .filter(sub => sub.packageName.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [subscriptions, searchTerm])


    const displayedSubscriptions = filteredSubscriptions.slice(0, visibleCount);
    const hasMore = filteredSubscriptions.length > visibleCount;

    const handleShowMore = () => setVisibleCount(prev => prev + 5);
    const handleCollapse = () => setVisibleCount(5);

    const isPeselMissing = !user?.pesel

    return (
        <div className="container mx-auto px-4 py-25">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-5xl mx-auto transition-all duration-500">

                <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Twoje Konto</h1>
                        <p className="text-gray-500 mt-1">Witaj, <span className="text-[#4E61F6] font-semibold">{user?.firstName}</span>!</p>
                    </div>
                    <div className="w-16 h-16 bg-[#E4E7FE] rounded-full flex items-center justify-center text-2xl font-bold text-[#4E61F6]">
                        {user?.firstName?.charAt(0).toUpperCase()}
                    </div>
                </div>

                {isPeselMissing && (
                    <div onClick={() => setIsEditModalOpen(true)} className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start gap-3 cursor-pointer hover:bg-yellow-100 transition-colors group">
                        <div className="text-yellow-600 mt-0.5">⚠️</div>
                        <div>
                            <h4 className="text-yellow-800 font-bold">Uzupełnij dane</h4>
                            <p className="text-yellow-700 text-sm mt-1">Prawo wymaga podania numeru PESEL przy zakupie ubezpieczenia. <span className="underline font-semibold ml-1 group-hover:text-yellow-900">Kliknij tutaj.</span></p>
                        </div>
                    </div>
                )}


                {activeTab === 'notifications' ? (
                    <div className="animate-fade-in">
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className="flex items-center gap-2 text-gray-500 hover:text-[#4E61F6] font-bold mb-6 transition-colors group"
                        >
                            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/>
                            Wróć do panelu głównego
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Centrum Powiadomień</h2>
                        <p className="text-gray-500 mb-6">Historia Twoich aktywności i komunikatów systemowych.</p>

                        <NotificationsPanel />
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-3 gap-8 animate-fade-in">

                            <div className="md:col-span-1 space-y-6">
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold text-gray-700">Twoje dane</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsEditModalOpen(true)} className="text-[#4E61F6] hover:bg-blue-50 p-1 rounded"><EditIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setIsPasswordModalOpen(true)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded"><LockIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div><p className="text-xs text-gray-500 font-bold">Imię i nazwisko</p><p
                                            className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
                                        </div>
                                        <div><p className="text-xs text-gray-500 font-bold">Email</p><p
                                            className="font-medium text-gray-800 truncate"
                                            title={user?.email}>{user?.email}</p></div>
                                        <div><p className="text-xs text-gray-500 font-bold">Telefon</p><p
                                            className="font-medium text-gray-800">{user?.phoneNumber || '-'}</p></div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold">Data urodzenia</p>
                                            <p className={`font-medium ${user?.birthDate ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                                {user?.birthDate ? new Date(user.birthDate).toLocaleDateString('pl-PL') : 'Nie podano'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold">PESEL</p>
                                            {user?.pesel ? (
                                                <SensitiveData text={user.pesel}/>
                                            ) : (
                                                <p className="font-medium text-sm text-red-500 flex items-center gap-1">Brak
                                                    (Wymagany)</p>
                                            )}
                                        </div>
                                        <div className="pt-3 mt-3 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 font-bold">2FA / ZABEZPIECZENIA</p>
                                            <div
                                                className={`flex items-center gap-2 mt-1 text-sm font-bold ${user?.twoFactorEnabled ? 'text-green-600' : 'text-orange-500'}`}>
                                                <ShieldIcon className="w-4 h-4"/>
                                                {user?.twoFactorEnabled ? 'Włączone' : 'Wyłączone'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <button onClick={() => setActiveTab('subscriptions')}
                                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'subscriptions' ? 'bg-[#4E61F6] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
                                        <BriefcaseIcon className="w-5 h-5"/> Twoje Pakiety
                                    </button>
                                    <button onClick={() => setActiveTab('favorites')}
                                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'favorites' ? 'bg-[#4E61F6] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
                                        <HeartIcon className="w-5 h-5" filled={false}/> Ulubione Oferty
                                    </button>
                                    <button onClick={() => setActiveTab('notifications')}
                                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'notifications' ? 'bg-[#4E61F6] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
                                        <BellIcon className="w-5 h-5"/> Powiadomienia
                                        {unreadCount > 0 && <span
                                            className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
                                    </button>
                                    <button
                                        onClick={() => setIs2FAModalOpen(true)}
                                        className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors bg-white text-indigo-600 hover:bg-gray-50 border border-gray-200">
                                        <ShieldIcon className="w-5 h-5"/> Zarządzaj zabezpieczeniami
                                    </button>
                                </div>

                                <HealthPrevention birthDate={user?.birthDate}/>
                            </div>

                            <div className="md:col-span-2">
                                {loading ? <p>Ładowanie...</p> : (
                                    <>
                                        {activeTab === 'subscriptions' && (
                                            <div className="space-y-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                                    <h2 className="text-xl font-semibold text-gray-700">Aktywne umowy ({subscriptions.length})</h2>

                                                    <div className="relative w-full sm:w-64">
                                                        <input
                                                            type="text"
                                                            placeholder="Szukaj pakietu..."
                                                            value={searchTerm}
                                                            onChange={e => setSearchTerm(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none transition-all"
                                                        />
                                                        <div className="absolute left-3 top-2.5"><SearchIcon className="w-4 h-4" /></div>
                                                    </div>
                                                </div>

                                                {displayedSubscriptions.length > 0 ? (
                                                    <>
                                                        <div className="space-y-4">
                                                            {displayedSubscriptions.map(sub => (
                                                                <div key={sub.id} className="border border-blue-100 bg-blue-50/30 rounded-xl p-5 relative hover:shadow-md transition-shadow group animate-fade-in-up">
                                                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">AKTYWNY</div>

                                                                    <div className="flex justify-between items-start mb-2 mt-1">
                                                                        <div>
                                                                            <h3 className="text-xl font-bold text-gray-900">{sub.packageName}</h3>
                                                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Pakiet Medyczny</p>
                                                                        </div>
                                                                        <span className="text-[#4E61F6] font-bold text-2xl pr-2">{sub.price}</span>
                                                                    </div>

                                                                    <div className="bg-white/60 p-3 rounded-lg border border-blue-100/50 mb-4 mt-2 flex items-center gap-2">
                                                                        <CalendarIcon className="w-4 h-4 text-gray-400"/>
                                                                        <p className="text-sm text-gray-600">
                                                                            Ważny do: <b className="text-gray-800">{new Date(sub.endDate).toLocaleDateString('pl-PL')}</b>
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex justify-end gap-3 pt-2 border-t border-blue-100/50">
                                                                        <button onClick={() => handleOpenDetails(sub)} className="text-sm font-bold text-slate-600 hover:text-[#4E61F6] flex items-center gap-1.5 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:border-[#4E61F6] transition-all shadow-sm hover:cursor-pointer">
                                                                            <EyeIcon className="w-4 h-4"/> Szczegóły
                                                                        </button>
                                                                        <button onClick={() => handleOpenReview(sub.packageId || 0, sub.packageName)} className="text-sm font-bold text-yellow-700 hover:text-yellow-800 flex items-center gap-1.5 bg-yellow-100 border border-yellow-200 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-all shadow-sm">
                                                                            <StarIconOutline className="w-4 h-4"/> Oceń
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {(hasMore || visibleCount > 5) && (
                                                            <div className="text-center pt-4">
                                                                {hasMore ? (
                                                                    <button onClick={handleShowMore} className="text-sm font-bold text-[#4E61F6] hover:text-blue-700 bg-blue-50 px-6 py-2 rounded-full hover:bg-blue-100 transition-colors">
                                                                        Pokaż więcej ({filteredSubscriptions.length - visibleCount}) ▼
                                                                    </button>
                                                                ) : (
                                                                    <button onClick={handleCollapse} className="text-sm font-bold text-gray-500 hover:text-gray-700 bg-gray-100 px-6 py-2 rounded-full hover:bg-gray-200 transition-colors">
                                                                        Zwiń listę ▲
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <EmptyState
                                                        msg={searchTerm ? "Nie znaleziono pakietów." : "Nie masz jeszcze aktywnych pakietów."}
                                                        btnAction={() => searchTerm ? setSearchTerm('') : navigate('/kalkulator')}
                                                        btnText={searchTerm ? "Wyczyść" : "Przeglądaj ofertę"}
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'favorites' && (
                                            <div className="space-y-4">
                                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Zapisane oferty</h2>
                                                {favorites.length > 0 ? favorites.map(fav => (
                                                    <div key={fav.id} className="border border-gray-200 bg-white rounded-xl p-5 flex justify-between items-center hover:shadow-md transition-shadow">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-800">{fav.name}</h3>
                                                            <p className="text-[#4E61F6] font-bold">{fav.price}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <FavoriteButton packageId={fav.id}/>
                                                            <Button variant="primary" className="!text-xs !py-2" onClick={() => navigate('/kalkulator')}>Zobacz</Button>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <EmptyState msg="Nie masz ulubionych ofert." btnAction={() => navigate('/kalkulator')}/>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                            <Button onClick={handleLogout} variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100 shadow-none">Wyloguj się</Button>
                        </div>
                    </>
                )}
            </div>

            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}/>
            {reviewTarget && <AddReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} packageId={reviewTarget.id} packageName={reviewTarget.name}/>}
            <SubscriptionDetailsModal isOpen={!!viewingSub} onClose={() => setViewingSub(null)} subscription={viewingSub}/>
            <TwoFactorModal isOpen={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} />
        </div>
    )
}

const EmptyState = ({msg, btnAction, btnText = "Przeglądaj ofertę"}: { msg: string, btnAction: () => void, btnText?: string }) => (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
        <p className="text-gray-500 mb-4">{msg}</p>
        <Button onClick={btnAction} variant="primary" className="!text-sm !py-2 shadow-lg">{btnText}</Button>
    </div>
)