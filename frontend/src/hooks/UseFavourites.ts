import {createContext, useContext} from "react";
import type {IFavoritesContext} from "../types/ui.types.ts";

export const FavoritesContext = createContext<IFavoritesContext>(null as never);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }

    return context
}