import type {IPricingPlan, TBankOptionType, TBillingType, TPaymentMethodType} from "./pricing.types.ts";
import React from "react";

export interface ICheckoutFormData {
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
}

export interface ICardData {
    number: string;
    expiry: string;
    cvc: string;
    holder: string;
}

export interface IBankLoginData {
    login: string;
    password?: string;
}

export interface ICheckoutFinancials {
    dynamicTotal: number;
    amountToPayNow: number;
    savingsAmount: number;
    hasSavings: boolean;
    netto: string;
    vat: string;
    priceIncrease: number;
    durationMonths: number;
    effectiveStart: Date;
    effectiveEnd: Date;
}
export interface ICheckoutStepIndicatorProps {
    step: 1 | 2;
}
export interface ICheckoutOrderSummaryProps {
    plan: IPricingPlan;
    billingPeriod: TBillingType;
    financials: ICheckoutFinancials;
    onClose: () => void;
}
export interface IPaymentMethodSelectorProps {
    selectedMethod: TPaymentMethodType
    onSelect: (method: TPaymentMethodType) => void
}
export interface ICardPaymentFormProps {
    cardData: ICardData;
    setCardData: React.Dispatch<React.SetStateAction<ICardData>>;
    errors: Record<string, string>;
}
export interface ICheckoutSuccessScreenProps {
    countdown: number
    onRedirect: () => void
}
export interface ICheckoutPaymentFormProps {
    paymentMethod: TPaymentMethodType;
    setPaymentMethod: React.Dispatch<React.SetStateAction<TPaymentMethodType>>;
    selectedBank: TBankOptionType | null;
    setSelectedBank: (bank: TBankOptionType | null) => void;

    cardData: ICardData;
    setCardData: React.Dispatch<React.SetStateAction<ICardData>>;
    bankLogin: IBankLoginData;
    setBankLogin: React.Dispatch<React.SetStateAction<IBankLoginData>>;
    blikCode: string;
    setBlikCode: (code: string) => void;

    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    isProcessing: boolean;
    processingStatus: string;
    amountToPay: number;
    onBack: () => void;
    onPay: () => void;
}