import React, {type ReactNode} from "react";

export type IconProps = {
    className?: string;
    props?: React.SVGProps<SVGSVGElement>;
}
export interface IPricingPlan  {
    id: number,
    name: string,
    price: string,
    features: string[],
    description: string,
    averageRating: number,
    reviews: number,
    isFeatured?: boolean
}
export interface IReview {
    name: string,
    rating: number,
    comment: string,
    img: string
}
export interface IPartner {
    name: string,
    src: string
}
export type TModalProps = {
    isOpen: boolean,
    onClose: () => void,
    children: React.ReactNode
}
export type TRatingProps = {
    rating: number,
    reviews: number
}
export interface IUser {
    email: string,
    firstName: string,
    lastName: string
}
export interface IAuthContext {
    user: IUser | null
    token: string | null
    roles: string[]
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    isLoading: boolean
    error: string | null
}
export type AuthProviderProps = {
    children: ReactNode
}
export interface DecodedToken {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[]
    exp: number
    iat: number
    iss: string
    aud: string
}
export interface IUserDto {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    roles: string[]
}
export interface IUpdateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}
export interface IDashboardStats {
    totalUsers: number;
    totalPackagesAvailable: number;
    activeSubscriptions: number;
    expiringSubscriptions: number;
}