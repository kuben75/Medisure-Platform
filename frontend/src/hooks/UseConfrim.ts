import {createContext, useContext} from "react";
import type {ConfirmationContextType} from "../types/notifications.types.ts";

export const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined)
export const useConfirm = () => {
    const context = useContext(ConfirmationContext)
    if (!context) throw new Error('useConfirm must be used within a ConfirmationProvider')

    return context.confirm
}