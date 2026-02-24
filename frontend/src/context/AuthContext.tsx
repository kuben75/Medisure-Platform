import {type ReactNode, useEffect, useState, useCallback, useMemo} from 'react';
import type {IUser} from "../types/user.types";
import {AuthContext} from "../hooks/useAuth";
import {extractRolesFromToken, getStoredAuthData, STORAGE_KEYS} from "../utils/authHelpers";
import {displayApiError} from "../utils/apiErrorHandler.ts";
import {useNotification} from "../hooks/UseNotification.ts";

const LOGIN_API_URL = `${import.meta.env.VITE_API_URL}/auth/login`;

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const {notify} = useNotification();

    const [user, setUser] = useState<IUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleAuthSuccess = useCallback((newToken: string, newUser: IUser) => {
        setToken(newToken);
        setUser(newUser);
        setRoles(extractRolesFromToken(newToken));

        localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        setIsLoading(false);
    }, []);

    const clearAuthSession = useCallback(() => {
        setUser(null);
        setToken(null);
        setRoles([]);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    }, []);

    useEffect(() => {
        const storedData = getStoredAuthData();
        if (storedData) {
            setToken(storedData.token);
            setUser(storedData.user);
            setRoles(extractRolesFromToken(storedData.token));
        }
        else {
            clearAuthSession();
        }
        setIsLoading(false);
    }, [clearAuthSession]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEYS.TOKEN || e.key === STORAGE_KEYS.USER) {
                window.location.reload();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const setAuthSession = useCallback((newToken: string, newUser: IUser) => {
        handleAuthSuccess(newToken, newUser);
    }, [handleAuthSuccess]);

    const login = useCallback(async (email: string, password: string): Promise<string[] | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw data;
            }


            if (data.code === 'REQUIRES_2FA' || data.Code === 'REQUIRES_2FA') {
                return null;
            }


            handleAuthSuccess(data.token, data.user);
            return extractRolesFromToken(data.token);

        } catch (err) {
            displayApiError(err, notify);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleAuthSuccess, notify]);

    const logout = useCallback(() => {
        clearAuthSession();
    }, [clearAuthSession]);

    const updateUser = useCallback((userData: IUser) => {
        setUser(prev => {
            if (!prev) {
                return null;
            }
            const newUser = {...prev, ...userData};
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
            return newUser;
        });
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        roles,
        login,
        logout,
        updateUser,
        setAuthSession,
        isLoading,
        error
    }), [user, token, roles, login, logout, updateUser, setAuthSession, isLoading, error]);

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    )
}