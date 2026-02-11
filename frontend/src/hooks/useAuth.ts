import {createContext, useContext} from "react";
import type {IAuthContext} from "../types/auth.types.ts";

export const AuthContext = createContext<IAuthContext>(null as any);

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context
}