export type IconProps = {
    className?: string;
}
export interface IPricingPlan  {
    name: string,
    price: string,
    features: string[],
    description: string,
    isFeatured?: boolean,
    averageRating: string,
    reviews: string
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