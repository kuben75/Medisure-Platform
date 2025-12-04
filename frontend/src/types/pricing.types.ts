import React from "react";
import type {IUserSubscription} from "./user.types.ts";

export type TPaymentMethodType = 'card' | 'transfer' | 'paypal' | 'gpay'
export type TBankOptionType = 'blik' | 'mbank' | 'pko' | 'ing' | 'pekao' | 'millenium' | 'alior'

export interface IPricingPlan {
    id: number;
    name: string;
    price: string;
    priceValue: number;
    description: string;
    category: string;
    hasDentalCare: boolean;
    hasHospitalization: boolean;
    hasRehabilitation: boolean;
    specialistsCount: number;
    facilitiesCount: number;
    features: string[];
    averageRating: number;
    reviews: number;
    isFeatured?: boolean;
}

export interface ICalculationResultsProps {
    estimatedPrice: number
    packageType: string
    age: number
    recommendedPlan: IPricingPlan | null
    onShowDetails: (pkg: IPricingPlan) => void
}

export interface IFilterState {
    category: string
    maxPrice: number
    minSpecialists: number
    minFacilities: number
    hasDental: boolean
    hasHospital: boolean
    hasRehabilitation: boolean
    searchQuery: string
    showYearlyPrice: boolean
    sortOrder: 'default' | 'price_asc' | 'price_desc' | 'rating_desc' | 'rating_asc'
}

export interface IPackageFiltersProps {
    filters: IFilterState
    setFilters: React.Dispatch<React.SetStateAction<IFilterState>>
}

export interface AddressData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    houseNumber: string;
    city: string;
    zipCode: string;
}

export interface IPriceDetails {
    total: number;
    monthly: number;
    months: number;
    originalTotal: number;
    isDiscounted: boolean;
    discountLabel: string;
}
export interface ICheckoutOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    plan: IPricingPlan;
    priceDetails: IPriceDetails;
    onFinalize: (method: string, txId: string, addressData: AddressData) => void
}

export interface SubscriptionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscription: IUserSubscription | null;
}