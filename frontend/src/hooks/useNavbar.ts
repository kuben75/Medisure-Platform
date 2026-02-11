import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useUserNotifications} from "./useUserNotifications.ts";
import {useAuth} from "./useAuth.ts";

export const useNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const [lastClearedTime, setLastClearedTime] = useState<number>(0);

    const location = useLocation();
    const navigate = useNavigate();

    const {unreadCount, notifications, markAsRead, markAllAsRead} = useUserNotifications();
    const {user, logout, roles} = useAuth();
    const isAdmin = roles?.includes('Admin');

    useEffect(() => {
        if (user?.email) {
            const storageKey = `cleared_date_${user.email}`;
            const stored = localStorage.getItem(storageKey);

            if (stored) {
                setLastClearedTime(parseInt(stored, 10));
            }
            else {
                setLastClearedTime(0);
            }

        }
    }, [user]);

    const handleClearRead = () => {
        if (!user?.email) {
            return;
        }

        const now = Date.now();
        setLastClearedTime(now);

        const storageKey = `cleared_date_${user.email}`;
        localStorage.setItem(storageKey, now.toString());
    };

    const visibleNotifications = notifications.filter(notif => {
        if (!notif.isRead) {
            return true;
        }

        const notifDate = new Date(notif.createdAt).getTime();
        return notifDate > lastClearedTime;
    });

    const canClear = visibleNotifications.some(n => n.isRead);


    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = (isMenuOpen || isNotificationsOpen) ? 'hidden' : 'auto';
    }, [isMenuOpen, isNotificationsOpen]);

    useEffect(() => {
        setIsNotificationsOpen(false);
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/login');
    };
    return {
        isMenuOpen,
        setIsMenuOpen,
        scrolled,
        isNotificationsOpen,
        setIsNotificationsOpen,
        unreadCount,
        visibleNotifications,
        markAsRead,
        markAllAsRead,
        handleLogout,
        isAdmin,
        handleClearRead,
        canClear,
        user,
        navigate,
        notifications
    }
}