import React from "react";
import type {IPricingPlan} from "./pricing.types.ts";

export type IconProps = {
    className?: string;
    props?: React.SVGProps<SVGSVGElement>;
}
export type TModalProps = {
    isOpen: boolean,
    onClose: () => void,
    children?: React.ReactNode,
    className?: string
}

export interface IEditProfileModalProps {
    isOpen: boolean
    onClose: () => void
}

export type TRatingProps = {
    rating: number,
    reviews: number
}
export interface IFavoritesContext {
    favoriteIds: number[]
    toggleFavorite: (packageId: number) => Promise<void>
    isFavorite: (packageId: number) => boolean
    loading: boolean
}

export interface IFavoriteButtonProps {
    packageId: number
    className?: string
}
export interface IComparisonModalProps {
    isOpen: boolean
    onClose: () => void
    packages: IPricingPlan[]
}