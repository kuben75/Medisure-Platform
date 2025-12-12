export interface IUser {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string | null | undefined;
    birthDate?: string | null;
    pesel?: string | null;
    twoFactorEnabled?: boolean;
    roles?: string[];
}

export interface IUserDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
    birthDate?: string | null;
    pesel?: string | null;
    roles: string[];
    isLocked: boolean;
}
export interface IUpdateUserDto {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
}

export interface IUserSubscription {
    id: number
    packageId: number
    packageName: string
    price: string
    transactionId?: string
    paymentMethod?: string
    startDate: string
    endDate: string
    status: string
    features: string[]
    street?: string
    houseNumber?: string
    city?: string
    zipCode?: string
}
export interface IUserFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSaveSuccess: () => void
    token: string | null
    userToEdit: IUserDto | null
}