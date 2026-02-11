import React, {type FormEvent} from "react";
import type {IUserSubscription} from "./user.types.ts";

export type TPaymentMethodType = 'card' | 'transfer' | 'paypal' | 'gpay'
export type TBankOptionType = 'blik' | 'mbank' | 'pko' | 'ing' | 'pekao' | 'millenium' | 'alior'
export type TBillingType = 'monthly' | 'upfront'

export interface ISubscriptionOption {
    id: string;
    label: string;
    description: string;
    months: number;
    discount: number;
    isRecurring: boolean;
}

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
    features: string[] | string;
    includedSpecializations?: string[] | string;
    averageRating: number;
    reviews: number;
    isFeatured?: boolean;
    calculatedPrice?: number;
}

export interface ICalculationResultsProps {
    estimatedPrice: number;
    packageType: string;
    age: number;
    recommendedPlan: IPricingPlan | null;
    onShowDetails: (pkg: IPricingPlan) => void;
}

export interface IFilterState {
    category: string;
    maxPrice: number;
    minSpecialists: number;
    minFacilities: number;
    hasDental: boolean;
    hasHospital: boolean;
    hasRehabilitation: boolean;
    searchQuery: string;
    showYearlyPrice: boolean;
    sortOrder: 'default' | 'price_asc' | 'price_desc' | 'rating_desc' | 'rating_asc';
}

export interface IPackageFiltersProps {
    filters: IFilterState;
    setFilters: React.Dispatch<React.SetStateAction<IFilterState>>;
}

export interface IAddressData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    houseNumber: string;
    city: string;
    zipCode: string;
    pesel?: string;
    startDate?: string | undefined;
    birthDate?: string;
}

export interface IPriceDetails {
    total: number;
    monthly: number;
    months: number;
    originalTotal: number;
    isDiscounted: boolean;
    discountLabel: string;
    label: string;
}

export interface ICheckoutOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    plan: IPricingPlan;
    priceDetails: IPriceDetails;
    onFinalize: (method: string, txId: string, addressData: IAddressData) => void;
    billingPeriod?: TBillingType;
}

export interface ISubscriptionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscription: IUserSubscription | null;
    onRefresh?: () => void;
}

export interface ICalculationData {
    type: string;
    age: number;
    familySize?: string;
    companySize?: number;
    maxPrice?: number;
}

export interface IComparisonContext {
    selectedPackages: IPricingPlan[];
    addToComparison: (pkg: IPricingPlan) => void;
    removeFromComparison: (packageId: number) => void;
    isInComparison: (packageId: number) => boolean;
    clearComparison: () => void;
    limit: number;
}

export interface IPaymentMethodsFormProps {
    paymentMethod: TPaymentMethodType;
    selectedBank: TBankOptionType | null;
    cardData: { number: string; expiry: string; cvc: string; holder: string };
    blikCode: string;
    bankLogin: { login: string; password: string };
    errors: Record<string, string>;
    amountToPayNow: number;
    isProcessing: boolean;
    processingStatus: string;
    onPaymentMethodChange: (method: TPaymentMethodType) => void;
    onSelectedBankChange: (bank: TBankOptionType | null) => void;
    onCardDataChange: (data: any) => void;
    onBlikCodeChange: (code: string) => void;
    onBankLoginChange: (login: any) => void;
    onErrorsClear: (key: string) => void;
    onBack: () => void;
    onPayment: () => void;
}

export interface IOrderSummaryProps {
    plan: IPricingPlan;
    billingPeriod: TBillingType;
    durationMonths: number;
    effectiveStart: Date;
    effectiveEnd: Date;
    priceIncrease: number;
    dynamicNetto: string;
    dynamicVat: string;
    dynamicTotalContractValue: number;
    safeAmountToPay: number;
    savingsAmount: number;
    hasSavings: boolean;
    onClose: () => void;
}

export interface IPersonalDataFormProps {
    formData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        birthDate: string;
        pesel: string;
        street: string;
        houseNumber: string;
        city: string;
        zipCode: string;
        startDate: string;
    };
    errors: Record<string, string>;
    isPeselLocked: boolean;
    isBirthDateLocked: boolean;
    saveInfo: boolean;
    onFormChange: (data: any) => void;
    onSaveInfoChange: (value: boolean) => void;
    onSubmit: (e: FormEvent) => void;
    onErrorsClear: (key: string) => void;
}