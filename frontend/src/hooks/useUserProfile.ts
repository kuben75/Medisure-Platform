import {useState, useCallback, useEffect, useMemo} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from './useAuth.ts';
import {useUserNotifications} from './useUserNotifications.ts';
import type {IPricingPlan, IUserSubscription} from "../types/pricing.types.ts";

export const useUserProfile = () => {
    const {user, logout, token, roles} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {unreadCount} = useUserNotifications();

    const [subscriptions, setSubscriptions] = useState<IUserSubscription[]>([]);
    const [favorites, setFavorites] = useState<IPricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('subscriptions');
    const [searchTerm, setSearchTerm] = useState('');

    const [viewingSub, setViewingSub] = useState<IUserSubscription | null>(null);
    const [reviewTarget, setReviewTarget] = useState<{ id: number, name: string } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

    const isAdmin = roles?.includes('Admin');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('tab') === 'notifications' && !isAdmin) {
            setActiveTab('notifications');
        }
    }, [location, isAdmin]);

    const refreshData = useCallback(async () => {
        if (!token) {
            return;
        }
        try {
            const subRes = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions`, {headers: {'Authorization': `Bearer ${token}`}});
            if (subRes.ok) {
                setSubscriptions(await subRes.json());
            }

            const favRes = await fetch(`${import.meta.env.VITE_API_URL}/favorites`, {headers: {'Authorization': `Bearer ${token}`}});
            if (favRes.ok) {
                setFavorites(await favRes.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const filteredSubscriptions = useMemo(() => {
        return subscriptions
            .filter(sub => sub.packageName.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [subscriptions, searchTerm]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const openReviewModal = (id: number, name: string) => {
        setReviewTarget({id, name});
        setIsReviewModalOpen(true);
    };

    return {
        user,
        loading,
        activeTab,
        setActiveTab,
        unreadCount,
        subscriptions,
        filteredSubscriptions,
        favorites,
        searchTerm,
        setSearchTerm,
        refreshData,
        handleLogout,

        modals: {
            viewingSub, setViewingSub,
            reviewTarget, setReviewTarget,
            isEditModalOpen, setIsEditModalOpen,
            isReviewModalOpen, setIsReviewModalOpen,
            isPasswordModalOpen, setIsPasswordModalOpen,
            is2FAModalOpen, setIs2FAModalOpen,
            openReviewModal
        }
    }
}