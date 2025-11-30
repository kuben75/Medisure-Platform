
import type {IUser} from "./user.types.ts";
import type {IPricingPlan} from "./pricing.types.ts";


export interface IAuthContext {
    user: IUser | null
    token: string | null
    roles: string[]
    login: (email: string, password: string) => Promise<string[] | null>
    logout: () => void
    updateUser: (userData: IUser) => void
    isLoading: boolean
    error: string | null
}

export interface IComparisonContext {
    selectedPackages: IPricingPlan[]
    addToComparison: (pkg: IPricingPlan) => void
    removeFromComparison: (packageId: number) => void
    isInComparison: (packageId: number) => boolean
    clearComparison: () => void
    limit: number
}