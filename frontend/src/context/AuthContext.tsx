import { createContext, useContext, useState } from 'react'
import type {AuthProviderProps, DecodedToken, IAuthContext, IUser} from "../types/types.ts"
import {jwtDecode} from "jwt-decode";

const LOGIN_API_URL = "https://localhost:44333/api/auth/login"
const AuthContext = createContext<IAuthContext>(null as any)

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<IUser | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [roles, setRoles] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.message || 'Błąd logowania')


            setUser(data.user);
            setToken(data.token);
            try {
                const decodedToken = jwtDecode<DecodedToken>(data.token);
                const tokenRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                Array.isArray(tokenRoles)
                    ? setRoles(tokenRoles)
                    : tokenRoles
                        ? setRoles([tokenRoles])
                        : setRoles([])
            } catch (e) {
                console.error("Błąd dekodowania tokena:", e)
                setRoles([]);
            }
            return true;

        } catch (err: any) {
            console.error(err)
            setError(err.message)
            return false
        } finally {
            setIsLoading(false)
        }
    };

    const logout = () => {
        setUser(null)
        setToken(null)
        setRoles([])
    }

    const value = {
        user,
        token,
        roles,
        login,
        logout,
        isLoading,
        error
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')

    return context
}