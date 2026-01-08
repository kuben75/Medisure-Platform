export interface IReview {
    id: number
    userName: string
    rating: number
    comment: string
    createdAt: string
}
export interface IAddReviewModalProps {
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
    id: number
    userName: string
    avatarText: string
    rating: number
    comment: string
    packageName?: string
}