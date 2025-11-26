export interface IReview {
    id: number
    userName: string
    rating: number
    comment: string
    createdAt: string
}

export interface ICreateReviewDto {
    packageId: number
    rating: number
    comment: string
}
export interface AddReviewModalProps {
    isOpen: boolean
    onClose: () => void
    packageId: number
    packageName: string
}
export interface IPendingReview {
    id: number
    userName: string
    userEmail: string
    packageName: string
    rating: number
    comment: string
    createdAt: string
}
export interface IReviewDisplay {
    id: number;
    userName: string;
    avatarText: string;
    rating: number;
    comment: string;
}