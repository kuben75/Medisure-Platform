import type {IUser} from "./user.types.ts";


export interface IAuthContext {
    user: IUser | null
    token: string | null
    roles: string[]
    login: (email: string, password: string) => Promise<string[] | null>
    logout: () => void
    updateUser: (userData: {
        firstName: string;
        lastName: string;
        twoFactorEnabled?: boolean;
        phoneNumber: string | null;
        roles?: string[];
        pesel: string | null;
        birthDate: string | null;
        email: string
    }) => void
    isLoading: boolean
    error: string | null
    setAuthSession: (token: string, user: IUser) => void
}

export interface IChangePasswordModalProps {
    isOpen: boolean
    onClose: () => void
}