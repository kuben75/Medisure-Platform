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

export interface IUserSubscription {
    id: number;
    packageId: number;
    packageName: string;
    price: string;
    transactionId?: string;
    paymentMethod?: string;
    startDate: string;
    endDate: string;
    status: string;
    features: string[] | string;
    street?: string;
    houseNumber?: string;
    city?: string;
    zipCode?: string;
}

export interface ISubscriptionsTabProps {
    subscriptions: IUserSubscription[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onOpenDetails: (sub: IUserSubscription) => void;
    onOpenReview: (id: number, name: string) => void;
    onBrowse: () => void;
}

export interface IUserTableProps {
    users: IUserDto[];
    currentUser: any;
    amISuperAdmin: boolean;
    onEdit: (user: IUserDto) => void;
    onDelete: (id: string) => void;
    onChangeRole: (user: IUserDto) => void;
    onBlock: (user: IUserDto) => void;
    onUnlock: (user: IUserDto) => void;
}

export interface IUserFormData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    birthDate: string;
}

export interface IUserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    token: string | null;
    userToEdit: IUserDto | null;
}

export interface IAvatarProps {
    name: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}