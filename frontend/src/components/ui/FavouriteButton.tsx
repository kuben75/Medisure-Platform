import React from 'react';
import type {IFavoriteButtonProps} from "../../types/ui.types.ts";
import {useFavorites} from "../../hooks/UseFavourites.ts";
import HeartIcon from "../icons/HeartIcon.tsx";


export default function FavoriteButton({ packageId, className = "" }: IFavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const active = isFavorite(packageId);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(packageId);
    }

    return (
        <button
            onClick={handleClick}
            className={`transition-all duration-200 hover:scale-110 active:scale-95 p-2 rounded-full hover:bg-slate-100 ${className} ${active ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
            title={active ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
        >
            <HeartIcon filled={active} className="w-6 h-6" />
        </button>
    )
}