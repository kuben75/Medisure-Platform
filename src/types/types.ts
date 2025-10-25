import React from "react";

export type IconProps = {
    className?: string;
    props?: React.SVGProps<SVGSVGElement>;
}
export interface IPricingPlan  {
    name: string,
    price: string,
    features: string[],
    description: string,
    isFeatured?: boolean,
    averageRating: number,
    reviews: number
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