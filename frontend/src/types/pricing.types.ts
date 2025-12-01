import React from "react";

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
    hasRehabilitation: boolean;
    sortOrder: 'default' | 'price_asc' | 'price_desc' | 'rating_desc';
}

export interface IPackageFiltersProps {
    filters: IFilterState
    setFilters: React.Dispatch<React.SetStateAction<IFilterState>>
}