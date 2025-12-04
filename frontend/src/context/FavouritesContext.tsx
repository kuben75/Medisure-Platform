import { FavoritesContext } from "../hooks/UseFavourites.ts"
import { type ReactNode, useEffect, useState} from "react"
import {useNotification} from "../hooks/UseNotification.ts";
import {useAuth} from "../hooks/useAuth.ts";

const API_URL_FAVORITES_IDS = `${import.meta.env.VITE_API_URL}/favorites/ids`
const API_URL_TOGGLE = `${import.meta.env.VITE_API_URL}/favorites`


export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();
    const { notify } = useNotification();

    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!token) {
                setFavoriteIds([])
                return
            }
            setLoading(true)
            try {
                const response = await fetch(API_URL_FAVORITES_IDS, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const ids = await response.json()
                    setFavoriteIds(ids)
                }
            } catch (error) {
                console.error("Błąd pobierania ulubionych", error);
            }
        }

        fetchFavorites()
    }, [token])

    const toggleFavorite = async (packageId: number) => {
        if (!token) {
            notify.info("Musisz się zalogować, aby dodać do ulubionych.")
            return
        }

        const isCurrentlyFavorite = favoriteIds.includes(packageId)

        setFavoriteIds(prev =>
            isCurrentlyFavorite
                ? prev.filter(id => id !== packageId)
                : [...prev, packageId]
        )

        try {
            const response = await fetch(`${API_URL_TOGGLE}/${packageId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!response.ok) throw new Error("Błąd serwera");

            const data = await response.json()
            notify.success(data.message)

        } catch (err) {
            notify.error("Nie udało się zmienić statusu ulubionych." + err)
            setFavoriteIds(prev =>
                isCurrentlyFavorite
                    ? [...prev, packageId]
                    : prev.filter(id => id !== packageId)
            )
        }
    }

    const isFavorite = (packageId: number) => favoriteIds.includes(packageId)

    const value = {
        favoriteIds,
        toggleFavorite,
        isFavorite,
        loading
    }

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    )
}
