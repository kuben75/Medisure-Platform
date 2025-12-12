import React, { useState, useEffect, useRef } from 'react';
import {useAuth} from "../../hooks/useAuth.ts";
import {useChat} from "../../context/ChatContext.tsx";
import XIcon from "../icons/XIcon.tsx";
import {ChatBubble, QuickReplies} from "../ui/ChatUiComponents.tsx";

const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>;

export default function ChatWidget() {
    const {roles } = useAuth();
    const { messages, sendMessageToAdmin, unreadCount, currentChatId, markAsRead } = useChat()

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    const myEmail = currentChatId

    const myMessages = messages.filter(m => {
        const msgSender = (m.user || "").toLowerCase();
        const msgTarget = (m.targetUserEmail || "").toLowerCase();
        const myId = myEmail.toLowerCase();

        if (msgSender === myId && m.type === "UserToAdmin") return true;

        if (m.type === "AdminToUser" && msgTarget === myId) return true;

        return false;
    });

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [myMessages, isOpen]);

    useEffect(() => {
        if (isOpen && unreadCount > 0) {
            markAsRead('')
        }
    }, [isOpen, unreadCount, markAsRead]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return
        await sendMessageToAdmin(input)
        setInput('')
    }

    if (roles?.includes("Admin")) return null

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in-up flex flex-col h-[550px]">

                    <div className="bg-gradient-to-r from-[#4E61F6] to-[#3649E8] p-5 text-white flex justify-between items-start shadow-md">
                        <div className="flex gap-3 items-center">
                            <div className="relative">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#4E61F6] rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-base">Zespół Medisure</h3>
                                <p className="text-xs text-blue-100 opacity-90">Jesteśmy online</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors">
                            <XIcon />
                        </button>
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto bg-[#F3F4F6] custom-scrollbar flex flex-col">
                        {myMessages.length === 0 && (
                            <div className="text-center mt-12 opacity-60 px-4">
                                <div className="text-4xl mb-3">👋</div>
                                <h4 className="font-bold text-gray-700">Witaj!</h4>
                                <p className="text-sm text-gray-500">W czym możemy Ci dzisiaj pomóc?</p>
                            </div>
                        )}

                        {myMessages.map((msg, idx) => {
                            const isMe = (msg.user || "").toLowerCase() === myEmail
                            const isSystem = (msg.user || "").toLowerCase() === "system"

                            let senderName = "Admin"
                            if (isMe) senderName = "Ja"
                            else if (isSystem) senderName = "System"

                            return (
                                <ChatBubble
                                    key={idx}
                                    message={msg.message}
                                    isMe={isMe}
                                    timestamp={new Date(msg.timestamp)}
                                    senderName={senderName}
                                />
                            )
                        })}
                        <div ref={bottomRef} />
                    </div>

                    <div className="p-3 bg-white border-t border-gray-100">
                        {!input && messages.length < 5 && (
                            <div className="mb-2">
                                <QuickReplies onSelect={setInput} />
                            </div>
                        )}

                        <form onSubmit={handleSend} className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Napisz wiadomość..."
                                className="flex-grow px-4 py-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                            />
                            <button type="submit" className="p-2.5 bg-[#4E61F6] text-white rounded-full hover:bg-blue-700 transition-transform active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed" disabled={!input.trim()}>
                                <SendIcon />
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-16 h-16 bg-[#4E61F6] text-white rounded-full shadow-[0_4px_20px_rgba(78,97,246,0.4)] flex items-center justify-center hover:scale-110 transition-transform duration-300 hover:bg-blue-700 group z-50"
            >
                {isOpen ? <XIcon className="w-8 h-8"/> : <ChatBubbleIcon />}
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
    )
}