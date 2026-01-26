import {useAuth} from "./useAuth.ts";
import {useChat} from "./useChat.ts";
import React, {useEffect, useRef, useState} from "react";

export const useChatWidget = () => {
    const {roles } = useAuth();
    const { messages, sendMessageToAdmin, unreadCount, currentChatId, markAsRead } = useChat()

    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    const myEmail = currentChatId

    const myMessages = messages.filter(m => {
        const msgSender = (m.user || "").toLowerCase()
        const msgTarget = (m.targetUserEmail || "").toLowerCase()
        const myId = currentChatId.toLowerCase()

        if (msgSender === myId && m.type === "UserToAdmin") return true

        if (m.type === "AdminToUser" && msgTarget === myId) return true

        if (m.type === "AdminToUser" && msgSender === "system" && msgTarget === myId) return true

        return false
    })

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [myMessages, isOpen]);

    useEffect(() => {
        if (isOpen && unreadCount > 0)
            markAsRead('')

    }, [isOpen, unreadCount, markAsRead])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return
        await sendMessageToAdmin(input)
        setInput('')
    }
    return {
        isOpen,
        setIsOpen,
        input,
        setInput,
        bottomRef,
        myMessages,
        myEmail,
        handleSend,
        roles,
        unreadCount,
        messages
    }
}