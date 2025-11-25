import React from "react";

export type IconProps = {
    className?: string;
    props?: React.SVGProps<SVGSVGElement>;
}
export type TModalProps = {
    isOpen: boolean,
    onClose: () => void,
    children: React.ReactNode
}

export interface IEditProfileModalProps {
    isOpen: boolean
    onClose: () => void
}

export type TRatingProps = {
    rating: number,
    reviews: number
}