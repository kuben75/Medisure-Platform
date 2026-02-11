import {createContext, useContext} from "react";
import type {IChatContext} from "../types/chat.types.ts";

export const ChatContext = createContext<IChatContext | null>(null);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat musi być używany wewnątrz ChatProvider');
    }
    return context
}