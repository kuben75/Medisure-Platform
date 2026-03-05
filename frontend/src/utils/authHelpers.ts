import type {IUser} from "../types/user.types";
import {ROLE_CLAIM_TYPE, STORAGE_KEYS} from "../constants/auth.constants.ts";

export const parseJwt = (token: string): Record<string, unknown> | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Błąd tokena JWT ", e);
        return null;
    }
};

export const extractRolesFromToken = (token: string): string[] => {
    const decoded = parseJwt(token);
    if (!decoded) {
        return [];
    }
    const roles = decoded[ROLE_CLAIM_TYPE];

    if (Array.isArray(roles)) {
        return roles;
    }
    if (typeof roles === 'string') {
        return [roles];
    }
    return [];
};

export const getStoredAuthData = () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);

    if (token && userStr) {
        try {
            return {
                token,
                user: JSON.parse(userStr) as IUser
            };
        } catch {
            return null
        }
    }
    return null
}

export const isTokenExpired = (token: string) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        return (payload.exp * 1000) < Date.now();
    } catch (e) {
        return true;
    }
};