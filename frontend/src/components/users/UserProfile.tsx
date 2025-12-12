import {useEffect, useState, useMemo, useCallback} from 'react'
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
import NotificationsPanel from "./NotificationsPanel.tsx";
import {useUserNotifications} from "../../hooks/useUserNotifications.ts";
import BellIcon from "../icons/BellIcon.tsx";
import EyeIcon from "../icons/EyeIcon.tsx";
import HealthPrevention from "../ui/HealthPrevention.tsx";
import ShieldIcon from "../icons/ShieldIcon.tsx";
import TwoFactorModal from "./TwoFactorModal.tsx";
import ArrowLeftIcon from "../icons/ArrowLeftIcon.tsx";

const ChevronIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
)

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

    const [isProfileExpanded, setIsProfileExpanded] = useState(false);

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

    const refreshData = useCallback(async () => {
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
    }, [token])

    useEffect(() => {
        refreshData()
    }, [refreshData, activeTab])

    const filteredSubscriptions = useMemo(() => {
        return subscriptions
            .filter(sub => sub.packageName.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [subscriptions, searchTerm])

    const getStatusBadge = (sub: IUserSubscription) => {
        const now = new Date()
        const startDate = new Date(sub.startDate)
        const endDate = new Date(sub.endDate)

        if (sub.status === 'Cancelled') return <div className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">ANULOWANA</div>
        if (startDate > now) return <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">OCZEKUJĄCA</div>
        if (endDate < now) return <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">WYGASŁA</div>
        return <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">AKTYWNA</div>
    }

    const displayedSubscriptions = filteredSubscriptions.slice(0, visibleCount)
    const hasMore = filteredSubscriptions.length > visibleCount

    const handleShowMore = () => setVisibleCount(prev => prev + 5)
    const handleCollapse = () => setVisibleCount(5)

    return (
        <div className="container mx-auto px-0 md:px-4 py-4 md:py-12 mt-12 md:mt-16 max-w-6xl">
            <div className="bg-white md:rounded-2xl shadow-sm md:shadow-lg border-y md:border border-gray-200 overflow-hidden">

                <div className="bg-white p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-[#E4E7FE] rounded-full flex items-center justify-center text-2xl font-bold text-[#4E61F6] shadow-sm">
                            {user?.firstName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Twoje Konto</h1>
                            <p className="text-gray-500 text-sm md:text-base">Witaj, <span className="text-[#4E61F6] font-semibold">{user?.firstName}</span>!</p>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="md:hidden absolute top-6 right-6 text-gray-400 hover:text-red-500 p-2">
                        <LockIcon className="w-5 h-5"/>
                    </button>
                </div>

                {activeTab === 'notifications' ? (
                    <div className="p-6 md:p-8 md:!pt-4 animate-fade-in">
                        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Centrum Powiadomień</h2>
                                <p className="text-gray-500 text-sm">Historia Twoich aktywności i komunikatów systemowych.</p>
                            </div>

                            <button
                                onClick={() => setActiveTab('subscriptions')}
                                className="self-start md:self-center flex items-center gap-2 text-gray-500 hover:text-[#4E61F6] font-bold transition-colors group text-sm bg-gray-50 px-4 py-2 rounded-lg border border-transparent hover:border-blue-100 hover:bg-blue-50"
                            >
                                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
                                Wróć do panelu
                            </button>
                        </div>

                        <NotificationsPanel />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-12 min-h-[600px]">

                        <div className="md:col-span-4 lg:col-span-3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">

                            <div className="p-5 border-b border-slate-200">
                                <div
                                    className="flex justify-between items-center cursor-pointer md:cursor-default"
                                    onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                                >
                                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Twoje dane</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`md:hidden transition-transform duration-300 ${isProfileExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronIcon className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className={`mt-4 space-y-4 transition-all duration-300 overflow-hidden ${isProfileExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100'}`}>
                                    <div className="flex gap-2 mb-2">
                                        <button onClick={() => setIsEditModalOpen(true)} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded text-slate-600 hover:text-[#4E61F6] hover:border-[#4E61F6] flex items-center gap-1 transition-all"><EditIcon className="w-3 h-3"/> Edytuj</button>
                                        <button onClick={() => setIsPasswordModalOpen(true)} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded text-slate-600 hover:text-red-500 hover:border-red-500 flex items-center gap-1 transition-all"><LockIcon className="w-3 h-3"/> Hasło</button>
                                    </div>

                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Email</p><p className="font-medium text-gray-800 text-sm truncate" title={user?.email}>{user?.email}</p></div>
                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Telefon</p><p className="font-medium text-gray-800 text-sm">{user?.phoneNumber || '-'}</p></div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Data urodzenia</p>
                                        <p className={`font-medium text-sm ${user?.birthDate ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                            {user?.birthDate ? new Date(user.birthDate).toLocaleDateString('pl-PL') : 'Nie podano'}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-200">
                                        <div className={`flex items-center gap-2 text-xs font-bold ${user?.twoFactorEnabled ? 'text-green-600' : 'text-orange-500'}`}>
                                            <ShieldIcon className="w-3 h-3"/>
                                            {user?.twoFactorEnabled ? '2FA Aktywne' : '2FA Nieaktywne'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 space-y-1 sticky top-0">
                                <button onClick={() => setActiveTab('subscriptions')}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium ${activeTab === 'subscriptions' ? 'bg-white text-[#4E61F6] shadow-sm border border-gray-100 font-bold' : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'}`}>
                                    <BriefcaseIcon className="w-5 h-5"/> Twoje Pakiety
                                </button>
                                <button onClick={() => setActiveTab('favorites')}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium ${activeTab === 'favorites' ? 'bg-white text-[#4E61F6] shadow-sm border border-gray-100 font-bold' : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'}`}>
                                    <HeartIcon className="w-5 h-5" filled={false}/> Ulubione Oferty
                                </button>
                                <button onClick={() => setActiveTab('notifications')}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium ${activeTab === 'notifications' ? 'bg-white text-[#4E61F6] shadow-sm border border-gray-100 font-bold' : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'}`}>
                                    <BellIcon className="w-5 h-5"/> Powiadomienia
                                    {unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>}
                                </button>
                                <button onClick={() => setIs2FAModalOpen(true)}
                                        className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium text-gray-600 hover:bg-white/50 hover:text-gray-900">
                                    <ShieldIcon className="w-5 h-5"/> Bezpieczeństwo
                                </button>
                            </div>

                            <div className="p-4 md:block hidden">
                                <HealthPrevention birthDate={user?.birthDate ?? undefined}/>
                            </div>
                        </div>

                        <div className="md:col-span-8 lg:col-span-9 p-6 md:p-8 bg-white">
                            {loading ? <p className="text-gray-400 text-center py-10">Ładowanie danych...</p> : (
                                <>
                                    {activeTab === 'subscriptions' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                                                <h2 className="text-xl font-bold text-gray-800">Aktywne umowy <span className="text-gray-400 font-normal text-base">({subscriptions.length})</span></h2>

                                                <div className="relative w-full sm:w-64">
                                                    <input
                                                        type="text"
                                                        placeholder="Szukaj..."
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                                                    />
                                                    <div className="absolute left-3 top-2.5 text-gray-400"><SearchIcon className="w-4 h-4" /></div>
                                                </div>
                                            </div>

                                            {displayedSubscriptions.length > 0 ? (
                                                <>
                                                    <div className="grid gap-4">
                                                        {displayedSubscriptions.map(sub => (
                                                            <div key={sub.id} className="group border border-gray-200 rounded-xl p-5 hover:border-[#4E61F6] hover:shadow-md transition-all bg-white relative overflow-hidden">
                                                                {getStatusBadge(sub)}

                                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 mt-2">
                                                                    <div>
                                                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#4E61F6] transition-colors">{sub.packageName}</h3>
                                                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pakiet Medyczny</p>
                                                                    </div>
                                                                    <span className="text-[#4E61F6] font-bold text-xl">{sub.price}</span>
                                                                </div>

                                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg w-fit">
                                                                    <CalendarIcon className="w-4 h-4 text-gray-400"/>
                                                                    <span>Ważny do: <b className="text-gray-800">{new Date(sub.endDate).toLocaleDateString('pl-PL')}</b></span>
                                                                </div>

                                                                <div className="flex justify-end gap-3 border-t border-gray-100 pt-3">
                                                                    <button onClick={() => handleOpenDetails(sub)} className="text-xs font-bold text-gray-600 hover:text-[#4E61F6] flex items-center gap-1 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#4E61F6] transition-all">
                                                                        <EyeIcon className="w-3 h-3"/> Szczegóły
                                                                    </button>
                                                                    <button onClick={() => handleOpenReview(sub.packageId || 0, sub.packageName)} className="text-xs font-bold text-yellow-700 hover:text-yellow-800 flex items-center gap-1 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg hover:bg-yellow-100 transition-all">
                                                                        <StarIconOutline className="w-3 h-3"/> Oceń
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {(hasMore || visibleCount > 5) && (
                                                        <div className="text-center pt-4">
                                                            {hasMore ? (
                                                                <button onClick={handleShowMore} className="text-sm font-bold text-[#4E61F6] hover:bg-blue-50 px-6 py-2 rounded-full transition-colors">
                                                                    Pokaż więcej ({filteredSubscriptions.length - visibleCount}) ▼
                                                                </button>
                                                            ) : (
                                                                <button onClick={handleCollapse} className="text-sm font-bold text-gray-500 hover:bg-gray-100 px-6 py-2 rounded-full transition-colors">
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
                                                    btnText={searchTerm ? "Wyczyść filtry" : "Przeglądaj ofertę"}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'favorites' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Zapisane oferty</h2>
                                            {favorites.length > 0 ? (
                                                <div className="grid gap-4">
                                                    {favorites.map(fav => (
                                                        <div key={fav.id} className="border border-gray-200 bg-white rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all hover:border-[#4E61F6]">
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-800">{fav.name}</h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[#4E61F6] font-bold text-lg">{fav.price}</span>
                                                                    <span className="text-xs text-gray-400">/ mies</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                                <FavoriteButton packageId={fav.id}/>
                                                                <Button variant="primary" className="!text-xs !py-2.5 flex-grow sm:flex-grow-0 text-center" onClick={() => navigate('/kalkulator')}>Zobacz ofertę</Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState msg="Nie masz ulubionych ofert." btnAction={() => navigate('/kalkulator')}/>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center md:hidden pb-8">
                <Button onClick={handleLogout} variant="secondary" className="bg-white border-red-200 text-red-600 w-full py-3 shadow-sm">Wyloguj się</Button>
            </div>

            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}/>
            {reviewTarget && <AddReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} packageId={reviewTarget.id} packageName={reviewTarget.name}/>}
            <TwoFactorModal isOpen={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} />

            <SubscriptionDetailsModal
                isOpen={!!viewingSub}
                onClose={() => setViewingSub(null)}
                subscription={viewingSub}
                onRefresh={refreshData}
            />
        </div>
    )
}

const EmptyState = ({msg, btnAction, btnText = "Przeglądaj ofertę"}: { msg: string, btnAction: () => void, btnText?: string }) => (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50 flex flex-col items-center justify-center h-64">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <BriefcaseIcon className="w-8 h-8 text-gray-300"/>
        </div>
        <p className="text-gray-500 font-medium mb-6">{msg}</p>
        <Button onClick={btnAction} variant="primary" className="!text-sm !py-2.5 shadow-lg hover:scale-105 transition-transform">{btnText}</Button>
    </div>
)