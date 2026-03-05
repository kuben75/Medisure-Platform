import {createContext, useContext} from "react";
import type {IAuthContext} from "../types/auth.types.ts";

export const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth musi być używany wewnątrz AuthProvider');
    }

    return context
}