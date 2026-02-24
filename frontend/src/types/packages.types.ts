export interface IPackage {
    id: number;
    name: string;
    description: string;
    category: string;
    price: string;
    priceValue: number;
    features: string;
    includedSpecializations: string;
    specialistsCount: number;
    facilitiesCount: number;
    hasDentalCare: boolean;
    hasHospitalization: boolean;
    hasRehabilitation: boolean;
    isFeatured: boolean;
    averageRating?: number;
    reviews?: number;
    calculatedPrice?: number;
}
export type IPackageFormData = Omit<IPackage, 'id' | 'averageRating' | 'reviews' | 'calculatedPrice'>;
