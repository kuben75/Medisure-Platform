import {type ReactNode, useEffect, useState} from 'react'
import type {IUser} from "../types/user.types.ts";
import {AuthContext as AuthContext1} from "../hooks/useAuth.ts";

const LOGIN_API_URL = `${import.meta.env.VITE_API_URL}/auth/login`

function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        return JSON.parse(jsonPayload)
    } catch (e ) {
        return null
    }
}
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<IUser | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [roles, setRoles] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('auth_user')

        if (storedToken && storedUser) {
            try {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))

                const decodedToken = parseJwt(storedToken)
                let finalRoles: string[] = []
                if (decodedToken) {
                    const tokenRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
                    if (Array.isArray(tokenRoles)) {
                        finalRoles = tokenRoles
                    } else if (typeof tokenRoles === 'string') {
                        finalRoles = [tokenRoles]
                    }
                }
                setRoles(finalRoles)
            } catch (e) {
                console.error("Błąd przywracania sesji", e)
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_user')
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string): Promise<string[] | null> => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Błąd logowania')

            setUser(data.user)
            setToken(data.token)

            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));

            let finalRoles: string[] = []
            const decodedToken = parseJwt(data.token)
            if (decodedToken) {
                const tokenRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                if (Array.isArray(tokenRoles)) finalRoles = tokenRoles
                else if (typeof tokenRoles === 'string') finalRoles = [tokenRoles]
            }
            setRoles(finalRoles)

            return finalRoles

        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : String(err))
            return null
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        setUser(null);
        setToken(null);
        setRoles([]);

        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    const updateUser = (userData: IUser) => {
        setUser(prev => {
            if (!prev) return null;
            const newUser = { ...prev, ...userData };

            localStorage.setItem('auth_user', JSON.stringify(newUser));

            return newUser;
        })
    }

    const value = {
        user,
        token,
        roles,
        login,
        logout,
        updateUser,
        isLoading,
        error
    }

    return (
        <AuthContext1 value={value}>
            {!isLoading && children}
        </AuthContext1>
    )
}

