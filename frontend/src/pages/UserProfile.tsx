import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Button from '../components/ui/Button.tsx';
import EditProfileModal from "../components/admin/EditProfileModal.tsx";
import type {IUserSubscription} from "../types/user.types.ts";
import StarIconOutline from "../components/icons/StarIconOutline.tsx";
import AddReviewModal from "../components/ui/AddReviewModal.tsx";
import type {IPricingPlan} from "../types/pricing.types.ts";
import FavoriteButton from "../components/ui/FavouriteButton.tsx";
import {useAuth} from "../hooks/useAuth.ts";

const PencilIcon = ({className = "w-4 h-4"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
         className={className}>
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125l-2.688-2.688"/>
    </svg>);
const HeartIcon = ({className = "w-4 h-4"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
         className={className}>
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
    </svg>);
const BriefcaseIcon = ({className = "w-4 h-4"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
         className={className}>
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"/>
    </svg>);
export default function UserProfile() {
    const {user, logout, token} = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('subscriptions');

    const [subscriptions, setSubscriptions] = useState<IUserSubscription[]>([]);
    const [favorites, setFavorites] = useState<IPricingPlan[]>([]);

    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewTarget, setReviewTarget] = useState<{ id: number, name: string } | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const handleOpenReview = (pkgId: number, pkgName: string) => {
        setReviewTarget({id: pkgId, name: pkgName});
        setIsReviewModalOpen(true);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const subRes = await fetch("https://localhost:44333/api/subscriptions", {headers: {'Authorization': `Bearer ${token}`}});
                if (subRes.ok) setSubscriptions(await subRes.json());

                const favRes = await fetch("https://localhost:44333/api/favorites", {headers: {'Authorization': `Bearer ${token}`}});
                if (favRes.ok) setFavorites(await favRes.json());

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData()
    }, [token, activeTab])

    return (
        <div className="container mx-auto px-4 py-25">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-5xl mx-auto">

                <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Twoje Konto</h1>
                        <p className="text-gray-500 mt-1">Witaj, <span
                            className="text-[#4E61F6] font-semibold">{user?.firstName}</span>!</p>
                    </div>
                    <div
                        className="w-16 h-16 bg-[#E4E7FE] rounded-full flex items-center justify-center text-2xl font-bold text-[#4E61F6]">
                        {user?.firstName?.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">

                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-gray-700">Twoje dane</h3>
                                <button onClick={() => setIsEditModalOpen(true)}
                                        className="text-[#4E61F6] text-sm font-medium hover:underline"><PencilIcon/>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div><p className="text-xs text-gray-500 uppercase font-bold">Imię i nazwisko</p><p
                                    className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</p></div>
                                <div><p className="text-xs text-gray-500 uppercase font-bold">Email</p><p
                                    className="font-medium text-gray-800 truncate" title={user?.email}>{user?.email}</p>
                                </div>
                                <div><p className="text-xs text-gray-500 uppercase font-bold">Telefon</p><p
                                    className="font-medium text-gray-800">{user?.phoneNumber || '-'}</p></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('subscriptions')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'subscriptions' ? 'bg-[#4E61F6] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                            >
                                <BriefcaseIcon className="w-5 h-5"/> Twoje Pakiety
                            </button>
                            <button
                                onClick={() => setActiveTab('favorites')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'favorites' ? 'bg-[#4E61F6] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                            >
                                <HeartIcon className="w-5 h-5"/> Ulubione Oferty
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        {loading ? <p>Ładowanie...</p> : (
                            <>
                                {activeTab === 'subscriptions' && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Aktywne
                                            subskrypcje</h2>
                                        {subscriptions.length > 0 ? subscriptions.map(sub => (
                                            <div key={sub.id}
                                                 className="border border-blue-100 bg-blue-50/30 rounded-xl p-5 relative hover:shadow-md transition-shadow">
                                                <div
                                                    className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">AKTYWNY
                                                </div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-bold text-gray-800">{sub.packageName}</h3>
                                                    <span
                                                        className="text-[#4E61F6] font-bold text-lg pr-16">{sub.price}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-4">Ważny
                                                    do: <b>{new Date(sub.endDate).toLocaleDateString()}</b></p>
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleOpenReview(sub.packageId || 0, sub.packageName)}
                                                        className="text-sm font-medium text-yellow-600 hover:text-yellow-700 flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg hover:bg-yellow-100">
                                                        <StarIconOutline className="w-6 h-6"/> Oceń pakiet
                                                    </button>
                                                </div>
                                            </div>
                                        )) : (
                                            <EmptyState msg="Nie masz jeszcze aktywnych pakietów."
                                                        btnAction={() => navigate('/kalkulator')}/>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'favorites' && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Zapisane oferty</h2>
                                        {favorites.length > 0 ? favorites.map(fav => (
                                            <div key={fav.id}
                                                 className="border border-gray-200 bg-white rounded-xl p-5 flex justify-between items-center hover:shadow-md transition-shadow">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">{fav.name}</h3>
                                                    <p className="text-[#4E61F6] font-bold">{fav.price}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <FavoriteButton packageId={fav.id}/>
                                                    <Button variant="primary" className="!text-xs !py-2"
                                                            onClick={() => navigate('/kalkulator')}>Zobacz</Button>
                                                </div>
                                            </div>
                                        )) : (
                                            <EmptyState msg="Nie masz ulubionych ofert."
                                                        btnAction={() => navigate('/kalkulator')}/>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                    <Button onClick={handleLogout} variant="secondary"
                            className="bg-red-50 text-red-600 hover:bg-red-100 shadow-none">Wyloguj się</Button>
                </div>
            </div>

            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}/>
            {reviewTarget && <AddReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)}
                                             packageId={reviewTarget.id} packageName={reviewTarget.name}/>}
        </div>
    )
}

const EmptyState = ({msg, btnAction}: { msg: string, btnAction: () => void }) => (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500 mb-4">{msg}</p>
        <Button onClick={btnAction} variant="primary" className="!text-sm !py-2">Przeglądaj ofertę</Button>
    </div>
)