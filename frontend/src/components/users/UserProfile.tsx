import {useNavigate} from 'react-router-dom';
import Button from '../ui/Button.tsx';
import EditProfileModal from "./EditProfileModal.tsx";
import AddReviewModal from "../ui/modals/AddReviewModal.tsx";
import ChangePasswordModal from "./ChangePasswordModal.tsx";
import SubscriptionDetailsModal from "./SubscriptionDetailsModal.tsx";
import NotificationsPanel from "./NotificationsPanel.tsx";
import TwoFactorModal from "./TwoFactorModal.tsx";
import ArrowLeftIcon from "../icons/ArrowLeftIcon.tsx";
import LockIcon from "../icons/LockIcon.tsx";
import FavoriteButton from "../ui/FavouriteButton.tsx";
import ProfileSidebar from './ProfileSidebar.tsx';
import SubscriptionsTab from './SubscriptionsTab.tsx';
import {useUserProfile} from '../../hooks/useUserProfile.ts';

export default function UserProfile() {
    const navigate = useNavigate();
    const {
        user, loading, activeTab, setActiveTab, unreadCount,
         filteredSubscriptions, favorites,
        searchTerm, setSearchTerm, refreshData, handleLogout, modals
    } = useUserProfile()

    if (loading) return <div className="text-center py-20 text-gray-400">Ładowanie profilu...</div>;

    return (
        <div className="container mx-auto px-0 md:px-4 py-4 md:py-12 mt-12 md:mt-16 max-w-6xl">
            <div
                className="bg-white md:rounded-2xl shadow-sm md:shadow-lg border-y md:border border-gray-200 overflow-hidden">

                <div
                    className="bg-white p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 md:w-16 md:h-16 bg-[#E4E7FE] rounded-full flex items-center justify-center text-2xl font-bold text-[#4E61F6] shadow-sm">
                            {user?.firstName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Twoje Konto</h1>
                            <p className="text-gray-500 text-sm md:text-base">Witaj, <span
                                className="text-[#4E61F6] font-semibold">{user?.firstName}</span>!</p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                            className="md:hidden absolute top-6 right-6 text-gray-400 hover:text-red-500 p-2">
                        <LockIcon className="w-5 h-5"/>
                    </button>
                </div>

                {activeTab === 'notifications' ? (
                    <div className="p-6 md:p-8 md:!pt-4 animate-fade-in">
                        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Centrum Powiadomień</h2>
                                <p className="text-gray-500 text-sm">Historia Twoich aktywności i komunikatów
                                    systemowych.</p>
                            </div>
                            <button onClick={() => setActiveTab('subscriptions')}
                                    className="self-start md:self-center flex items-center gap-2 text-gray-500 hover:text-[#4E61F6] font-bold text-sm bg-gray-50 px-4 py-2 rounded-lg border border-transparent hover:border-blue-100 hover:bg-blue-50">
                                <ArrowLeftIcon className="w-4 h-4"/> Wróć do panelu
                            </button>
                        </div>
                        <NotificationsPanel/>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-12 min-h-[600px]">

                        <ProfileSidebar
                            user={user}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            unreadCount={unreadCount}
                            onEditProfile={() => modals.setIsEditModalOpen(true)}
                            onChangePassword={() => modals.setIsPasswordModalOpen(true)}
                            onOpen2FA={() => modals.setIs2FAModalOpen(true)}
                        />

                        <div className="md:col-span-8 lg:col-span-9 p-6 md:p-8 bg-white">
                            {activeTab === 'subscriptions' && (
                                <SubscriptionsTab
                                    subscriptions={filteredSubscriptions}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    onOpenDetails={modals.setViewingSub}
                                    onOpenReview={modals.openReviewModal}
                                    onBrowse={() => navigate('/kalkulator')}
                                />
                            )}

                            {activeTab === 'favorites' && (
                                <div className="space-y-4 animate-fade-in">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Zapisane
                                        oferty</h2>
                                    {favorites.length > 0 ? (
                                        <div className="grid gap-4">
                                            {favorites.map(fav => (
                                                <div key={fav.id}
                                                     className="border border-gray-200 bg-white rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all hover:border-[#4E61F6]">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-800">{fav.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span
                                                                className="text-[#4E61F6] font-bold text-lg">{fav.price}</span>
                                                            <span className="text-xs text-gray-400">/ mies</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                        <FavoriteButton packageId={fav.id}/>
                                                        <Button variant="primary"
                                                                className="!text-xs !py-2.5 flex-grow sm:flex-grow-0"
                                                                onClick={() => navigate('/kalkulator', {state: {highlightPackageId: fav.id}})}>Zobacz
                                                            ofertę</Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-400">Nie masz ulubionych
                                            ofert.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center md:hidden pb-8">
                <Button onClick={handleLogout} variant="secondary"
                        className="bg-white border-red-200 text-red-600 w-full py-3 shadow-sm">Wyloguj się</Button>
            </div>

            <ChangePasswordModal isOpen={modals.isPasswordModalOpen}
                                 onClose={() => modals.setIsPasswordModalOpen(false)}/>
            <EditProfileModal isOpen={modals.isEditModalOpen} onClose={() => modals.setIsEditModalOpen(false)}/>
            {modals.reviewTarget &&
                <AddReviewModal isOpen={modals.isReviewModalOpen} onClose={() => modals.setIsReviewModalOpen(false)}
                                packageId={modals.reviewTarget.id} packageName={modals.reviewTarget.name}/>}
            <TwoFactorModal isOpen={modals.is2FAModalOpen} onClose={() => modals.setIs2FAModalOpen(false)}/>
            <SubscriptionDetailsModal isOpen={!!modals.viewingSub} onClose={() => modals.setViewingSub(null)}
                                      subscription={modals.viewingSub} onRefresh={refreshData}/>
        </div>
    )
}