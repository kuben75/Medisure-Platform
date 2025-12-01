import React from "react";
import type {IPricingPlan} from "./pricing.types.ts";

export type IconProps = {
    className?: string
    props?: React.SVGProps<SVGSVGElement>
    isFilled?: string
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
    reviews: number,
    className?: string
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

export interface HeroCalcProps {
    onCalculate: (data: { type: string; age: number; familySize?: string; companySize?: number }) => void
    isCalculating: boolean
    initialAge?: number
}

export interface IFaqItem {
    q: string;
    a: string;
}