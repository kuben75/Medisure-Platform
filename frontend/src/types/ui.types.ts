import React from "react";
import type {IPricingPlan, ISubscriptionOption, TBillingType} from "./pricing.types.ts";

export type IconProps = {
    className?: string | "w-6 h-6"
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

export interface IHeroCalcProps {
    onCalculate: (data: {
        type: string;
        age: number;
        familySize?: string;
        companySize?: number;
        maxPrice?: number;
    }) => void;
    isCalculating: boolean;
    initialAge?: number | undefined;
}

export interface IFaqItem {
    q: string
    a: string
}

export type AccordionProps = {
    question: string
    answer: string
    isOpen?: boolean
    onToggle?: () => void
}
export interface ExtendedPackageDetailsModalProps extends IPackageDetailsModalProps {
    billingPeriod: TBillingType;
    setBillingPeriod: (val: TBillingType) => void;
}
export interface IPackageDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    plan: IPricingPlan | null
    userAge: number | undefined
    selectedDuration: string
    onDurationChange: (id: string) => void
    onProceedToCheckout: () => void
    options: ISubscriptionOption[]
    priceDetails: {
        label: string
        total: number
        monthly: number
        originalTotal: number
        isDiscounted: boolean
        months: number
        discountLabel: string
    }
    isBuying: boolean
}