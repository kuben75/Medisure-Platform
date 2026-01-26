import type {IPackageFormData} from "../types/ui.types.ts";

export const AVATAR_COLORS = [
    'from-blue-500 to-blue-600',
    'from-violet-500 to-violet-600',
    'from-fuchsia-500 to-fuchsia-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
]

export const QUICK_OPTIONS = ["Dzień dobry, szukam oferty", "Jaki pakiet wybrać?", "Pytanie o cennik", "Mam problem techniczny"]

export const SIZE_CLASSES = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
}
export const INITIAL_STATE: IPackageFormData = {
    name: '',
    price: '',
    priceValue: 0,
    category: 'Indywidualny',
    description: '',
    features: '',
    averageRating: 4.5,
    reviews: 0,
    specialistsCount: 10,
    facilitiesCount: 100,
    hasDentalCare: false,
    hasHospitalization: false,
    hasRehabilitation: false,
    isFeatured: false,
    includedSpecializations: ""
}
export const NAV_LINKS = [
    { to: "/", label: "Strona główna" },
    { to: "/przewodnik-pacjenta", label: "Przewodnik" },
    { to: "/kalkulator", label: "Kalkulator" },
    { to: "/specjalisci", label: "Specjaliści" },
    { to: "/kontakt", label: "Kontakt" },
]