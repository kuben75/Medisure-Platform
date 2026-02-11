import React from "react";
import type {ICalculationData, IPricingPlan, ISubscriptionOption, TBillingType} from "./pricing.types.ts";
import type {IUser} from "./user.types.ts";

export interface IIconProps {
    className?: string | "w-6 h-6";
    props?: React.SVGProps<SVGSVGElement>;
    isFilled?: string;
    hasUnread?: boolean;
}

export interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    className?: string;
}

export interface IEditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface IRatingProps {
    rating: number;
    reviews: number;
    className?: string;
}

export interface IFavoritesContext {
    favoriteIds: number[];
    toggleFavorite: (packageId: number) => Promise<void>;
    isFavorite: (packageId: number) => boolean;
    loading: boolean;
}

export interface IFavoriteButtonProps {
    packageId: number;
    className?: string;
}

export interface IComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    packages: IPricingPlan[];
}

export interface IHeroCalcProps {
    onCalculate: (data: ICalculationData) => void;
    isCalculating: boolean;
    initialAge?: number | undefined;
}

export interface IFaqItem {
    q: string;
    a: string;
}

export interface IAccordionProps {
    question: string;
    answer: string;
    isOpen?: boolean;
    onToggle?: () => void;
}

export interface IPackageDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: IPricingPlan | null;
    userAge: number | undefined;
    selectedDuration: string;
    onDurationChange: (id: string) => void;
    onProceedToCheckout: () => void;
    options: ISubscriptionOption[];
    priceDetails: {
        label: string
        total: number
        monthly: number
        originalTotal: number
        isDiscounted: boolean
        months: number
        discountLabel: string
    };
    isBuying: boolean;
    billingPeriod: TBillingType;
    setBillingPeriod: (val: TBillingType) => void;
}

export interface IPackageCardProps {
    pkg: IPricingPlan;
    isHighlighted: boolean;
    isBestMatch: boolean;
    displayPrice: string | number;
    isPriceIncreased: boolean;
    showPersonalizedPricing: boolean;
    showYearlyPrice: boolean;
    isInComparison: boolean;
    onToggleComparison: () => void;
    onOpenSpecs: (e: React.MouseEvent) => void;
    onOpenDetails: () => void;
}

export interface IProfileSidebarProps {
    user: IUser | null;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    unreadCount: number;
    onEditProfile: () => void;
    onChangePassword: () => void;
    onOpen2FA: () => void;
}

export interface IPackageTableProps {
    packages: IPricingPlan[];
    onEdit: (pkg: IPricingPlan) => void;
    onDelete: (id: number) => void;
}


export interface IPackageFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPackageAdded: () => void;
    token: string | null;
    packageToEdit: IPricingPlan | null;
}

export type TNavbarHeaderProps = {
    scrolled: boolean
    user: any
    isAdmin: boolean
    unreadCount: number
    setIsNotificationsOpen: (v: boolean) => void
    setIsMenuOpen: (v: boolean) => void
    handleLogout: () => void
}

export interface ITwoFactorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface BirthDatePickerProps {
    value: string;
    onChange: (date: string) => void;
}

export interface ISuccessScreenProps {
    countdown: number;
    onCountdownChange: (value: number) => void;
}