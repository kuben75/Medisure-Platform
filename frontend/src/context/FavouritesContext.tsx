import {FavoritesContext} from "../hooks/UseFavourites.ts";
import {type ReactNode, useCallback, useEffect, useState} from "react";
import {useNotification} from "../hooks/UseNotification.ts";
import {useAuth} from "../hooks/useAuth.ts";
import {displayApiError} from "../utils/apiErrorHandler.ts";

const API_URL_FAVORITES_IDS = `${import.meta.env.VITE_API_URL}/favorites/ids`;
const API_URL_TOGGLE = `${import.meta.env.VITE_API_URL}/favorites`;


export const FavoritesProvider = ({children}: { children: ReactNode }) => {
    const {token} = useAuth();
    const {notify} = useNotification();

    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFavorites = useCallback(async () => {
        if (!token) {
            setFavoriteIds([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(API_URL_FAVORITES_IDS, {
                headers: {'Authorization': `Bearer ${token}`}
            });

            if (!response.ok) {
                throw await response.json();
            }

            const ids = await response.json();
            setFavoriteIds(ids);
        } catch (error) {
            console.error("Nie udało się pobrać ulubionych:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);
    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const toggleFavorite = async (packageId: number) => {
        if (!token) {
            notify.info("Musisz się zalogować, aby dodać do ulubionych.");
            return;
        }

        const isCurrentlyFavorite = favoriteIds.includes(packageId);

        setFavoriteIds(prev =>
            isCurrentlyFavorite
                ? prev.filter(id => id !== packageId)
                : [...prev, packageId]
        );

        try {
            const response = await fetch(`${API_URL_TOGGLE}/${packageId}`, {
                method: 'POST',
                headers: {'Authorization': `Bearer ${token}`}
            });

            if (!response.ok) {
                throw await response.json();
            }

            const data = await response.json();
            notify.success(data.message || (isCurrentlyFavorite ? "Usunięto z ulubionych" : "Dodano do ulubionych"));

        } catch (err) {
            setFavoriteIds(prev =>
                isCurrentlyFavorite
                    ? [...prev, packageId]
                    : prev.filter(id => id !== packageId)
            );
            displayApiError(err, notify);
        }
    };

    const isFavorite = (packageId: number) => favoriteIds.includes(packageId);

    const value = {
        favoriteIds,
        toggleFavorite,
        isFavorite,
        loading
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    )
}
