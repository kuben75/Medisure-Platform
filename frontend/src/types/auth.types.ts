import type {ReactNode} from "react";

import type {IUser} from "./user.types.ts";

export type TAuthProviderProps = {
    children: ReactNode
}

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

export interface IDecodedToken {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[]
    exp: number
    iat: number
    iss: string
    aud: string
}