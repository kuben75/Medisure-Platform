import {useEffect, useState} from 'react';
import {useAuth} from '../context/AuthContext.tsx';
import {useNavigate} from 'react-router-dom';
import Button from '../components/ui/Button.tsx';
import EditProfileModal from "../components/admin/EditProfileModal.tsx";
import EditIcon from "../components/icons/EditIcon.tsx";
import type {IUserSubscription} from "../types/user.types.ts";
import StarIconOutline from "../components/icons/StarIconOutline.tsx";
import AddReviewModal from "../components/ui/AddReviewModal.tsx";

export default function UserProfile() {
    const { user, logout, token } = useAuth()
    const navigate = useNavigate()
    const [subscriptions, setSubscriptions] = useState<IUserSubscription[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const [reviewTarget, setReviewTarget] = useState<{ id: number, name: string } | null>(null)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleOpenReview = (pkgId: number, pkgName: string) => {
        setReviewTarget({ id: pkgId, name: pkgName })
        setIsReviewModalOpen(true)
    }

    useEffect(() => {
        const fetchSubscriptions = async () => {
            if (!token) return
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (response.ok) {
                    const data = await response.json()
                    setSubscriptions(data)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchSubscriptions()
    }, [token])

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-4xl mx-auto">
                <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Twoje Konto</h1>
                        <p className="text-gray-500 mt-1">Witaj ponownie, <span className="text-[#4E61F6] font-semibold">{user?.firstName}</span>!</p>
                    </div>
                    <div className="w-16 h-16 bg-[#E4E7FE] rounded-full flex items-center justify-center text-2xl font-bold text-[#4E61F6]">
                        {user?.firstName?.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-700">Twoje dane</h2>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="text-[#4E61F6] text-sm font-medium hover:underline flex items-center gap-1 hover:cursor-pointer"
                            >
                                <EditIcon/> Edytuj
                            </button>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Imię i nazwisko</p>
                            <p className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email</p>
                            <p className="font-medium text-gray-800 truncate" title={user?.email}>{user?.email}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Telefon</p>
                            <p className="font-medium text-gray-800">{user?.phoneNumber || '-'}</p>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700">Twoje aktywne pakiety</h2>

                        {loading ? (
                            <p className="text-gray-500">Ładowanie pakietów...</p>
                        ) : subscriptions.length > 0 ? (
                            <div className="space-y-4">
                                {subscriptions.map(sub => (
                                    <div key={sub.id}
                                         className="border border-blue-100 bg-blue-50/30 rounded-xl p-5 relative overflow-hidden hover:shadow-md transition-shadow">
                                        <div
                                            className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                            AKTYWNY
                                        </div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">{sub.packageName}</h3>
                                            <span className="text-[#4E61F6] font-bold text-lg pr-16">{sub.price}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Ważny od: <span
                                            className="font-medium">{new Date(sub.startDate).toLocaleDateString()}</span> do <span
                                            className="font-medium">{new Date(sub.endDate).toLocaleDateString()}</span>
                                        </p>

                                        <div className="mt-4 pt-4 border-t border-blue-100 flex justify-end">
                                            <button
                                                onClick={() => handleOpenReview(sub.packageId || 0, sub.packageName)}
                                                className="text-sm font-medium text-yellow-600 hover:text-yellow-700 flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors hover:cursor-pointer"
                                            >
                                                <StarIconOutline className="h-6 w-6"/> Oceń ten pakiet
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                                <p className="text-gray-500 mb-4">Nie masz jeszcze aktywnych pakietów.</p>
                                <Button onClick={() => navigate('/kalkulator')} variant="primary"
                                        className="!text-sm !py-2">
                                    Przeglądaj ofertę
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                    <Button onClick={handleLogout} variant="secondary"
                            className="bg-red-50 text-red-600 hover:bg-red-100 shadow-none">
                        Wyloguj się
                    </Button>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
            {reviewTarget && (
                <AddReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    packageId={reviewTarget.id}
                    packageName={reviewTarget.name}
                />
            )}
        </div>
    );
}