import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { IChatMessage } from "../../types/chat.types"
import { Avatar, ChatBubble, DateSeparator } from "../ui/ChatUiComponents.tsx"
import { formatTime } from "../../utils/FormatTime.tsx"
import CannedIcon from "../icons/CannedIcon.tsx"
import ArrowLeftIcon from "../icons/ArrowLeftIcon.tsx"
import { useChat } from "../../hooks/useChat.ts"
import SendIcon from "../icons/SendIcon.tsx";

const cannedResponses = [
    "Dzień dobry!",
    "Proszę o podanie numeru polisy.",
    "Czy mogę w czymś jeszcze pomóc?",
    "Dziękuję, sprawdzam to.",
    "Niestety nie mam takiej możliwości."
]

export default function AdminChatPanel() {
    const { messages, sendMessageToUser, onlineUsers, userDetails, markAsRead } = useChat()
    const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null)
    const [replyInput, setReplyInput] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState<'all' | 'unread' | 'online'>('all')
    const bottomRef = useRef<HTMLDivElement>(null)
    const [showCanned, setShowCanned] = useState(false)

    const conversationList = useMemo(() => {
        const groups: Record<string, { msgs: IChatMessage[], unread: number, lastMsg: IChatMessage, hasUserInteraction: boolean }> = {};

        messages.forEach(msg => {
            let key = ""
            if (msg.type === "UserToAdmin") key = msg.user
            else key = msg.targetUserEmail || "unknown"
            key = key.toLowerCase()

            if (!key || key === "unknown" || key === "admin" || key === "system")
                return

            if (!groups[key])
                groups[key] = { msgs: [], unread: 0, lastMsg: msg, hasUserInteraction: false }

            groups[key].msgs.push(msg)

            if (new Date(msg.timestamp) > new Date(groups[key].lastMsg.timestamp))
                groups[key].lastMsg = msg

            if (msg.type === "UserToAdmin" && !msg.isRead)
                groups[key].unread++

            if (msg.type === "UserToAdmin")
                groups[key].hasUserInteraction = true

        })
        return Object.entries(groups)
            .map(([email, data]) => {
                const details = userDetails?.[email];
                let displayName = email;

                if (details && (details.firstName || details.lastName)) {
                    displayName = `${details.firstName || ''} ${details.lastName || ''}`.trim();
                }

                const isOnline = onlineUsers?.includes(email) || false;

                data.msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                return {
                    email,
                    displayName,
                    ...data,
                    isOnline
                }
            })
            .filter(c => c.hasUserInteraction)
            .sort((a, b) => new Date(b.lastMsg.timestamp).getTime() - new Date(a.lastMsg.timestamp).getTime());
    }, [messages, onlineUsers, userDetails]);

    const filteredList = conversationList.filter(c => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = c.displayName.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);

        const matchesFilter =
            filter === 'all' ? true :
                filter === 'unread' ? c.unread > 0 :
                    filter === 'online' ? c.isOnline : true;

        return matchesSearch && matchesFilter;
    });

    useEffect(() => {
        if (selectedUserEmail) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

            const conversation = conversationList.find(c => c.email === selectedUserEmail);
            if (conversation && conversation.unread > 0) {
                markAsRead(selectedUserEmail);
            }
        }
    }, [selectedUserEmail, messages, conversationList, markAsRead]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserEmail || !replyInput.trim()) return;

        await sendMessageToUser(selectedUserEmail, replyInput);
        setReplyInput("");
        setShowCanned(false);
    };

    const activeConversation = selectedUserEmail ? conversationList.find(c => c.email === selectedUserEmail) : null;

    const renderMessagesWithSeparators = (msgs: IChatMessage[]) => {
        const result = [];
        let lastDate = "";

        for (let i = 0; i < msgs.length; i++) {
            const msg = msgs[i];
            const msgDate = new Date(msg.timestamp).toDateString();

            if (msgDate !== lastDate) {
                result.push(<DateSeparator key={`date-${i}`} date={new Date(msg.timestamp)} />);
                lastDate = msgDate;
            }

            const isOutgoing = msg.type === "AdminToUser";
            let senderName = "Ty";

            if (!isOutgoing) {
                senderName = activeConversation?.displayName || "User";
            } else if (msg.user === "System") {
                senderName = "System (Bot)";
            }

            result.push(
                <ChatBubble
                    key={msg.id || i}
                    message={msg.message}
                    isMe={isOutgoing}
                    timestamp={new Date(msg.timestamp)}
                    senderName={senderName}
                    isRead={true}
                />
            );
        }
        return result;
    };

    return (
        <div className="mt-4 md:mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[25vh] md:h-[700px] font-sans">

            <div className={`
                w-full md:w-[320px] border-r border-gray-200 bg-white flex-col flex-shrink-0
                ${selectedUserEmail ? 'hidden md:flex' : 'flex'}
            `}>
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
                    <h3 className="font-bold text-gray-800 text-lg tracking-tight">Skrzynka odbiorcza</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Szukaj..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4E61F6] outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
                        {[{ id: 'all', label: 'Wszyscy' }, { id: 'unread', label: 'Nieprzeczytane' }, { id: 'online', label: 'Online' }].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id as any)}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md whitespace-nowrap transition-all ${filter === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar bg-gray-50/30">
                    {filteredList.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-xs uppercase tracking-widest mt-10">
                            {messages.length > 0 ? "Brak wyników" : "Brak aktywnych użytkowników"}
                        </div>
                    ) : (
                        filteredList.map(c => {
                            const isSelected = selectedUserEmail === c.email;
                            const hasUnread = c.unread > 0;
                            const containerClass = isSelected ? 'bg-blue-50 border-l-[#4E61F6]' : hasUnread ? 'bg-white border-l-transparent hover:bg-gray-50' : 'bg-gray-50/40 border-l-transparent hover:bg-gray-100 grayscale-[0.3] opacity-85';

                            return (
                                <div
                                    key={c.email}
                                    onClick={() => setSelectedUserEmail(c.email)}
                                    className={`p-3 cursor-pointer flex gap-3 border-l-[3px] border-b border-gray-100 transition-all relative ${containerClass}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar name={c.displayName} size="md" />
                                        {c.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                                    </div>
                                    <div className="overflow-hidden flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <div className="flex flex-col overflow-hidden mr-2">
                                                <span className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}>
                                                    {c.displayName}
                                                </span>
                                            </div>
                                            <span className={`text-[10px] whitespace-nowrap ${hasUnread ? 'text-[#4E61F6] font-bold' : 'text-gray-400'}`}>
                                                {formatTime(new Date(c.lastMsg.timestamp))}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center mt-1">
                                            <p className={`text-xs truncate max-w-[150px] ${hasUnread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                                {c.lastMsg.user === 'System' && <span className="opacity-100 mr-1">🤖</span>}
                                                {c.lastMsg.user === 'Admin' && <span className="opacity-60 mr-1">Ty: </span>}
                                                {c.lastMsg.message}
                                            </p>
                                            {hasUnread && <span className="bg-[#4E61F6] text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full shadow-sm">{c.unread}</span>}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            <div className={`
                w-full md:w-2/3 flex-col bg-white relative
                ${selectedUserEmail ? 'flex' : 'hidden md:flex'}
            `}>
                {activeConversation ? (
                    <>
                        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-[0_2px_10px_-10px_rgba(0,0,0,0.1)] z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedUserEmail(null)}
                                    className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
                                >
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </button>

                                <Avatar name={activeConversation.displayName} size="md" />
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 flex flex-col md:flex-row md:items-center md:gap-2">
                                        <span>{activeConversation.displayName}</span>
                                        {activeConversation.email !== activeConversation.displayName && (
                                            <span className="text-xs text-gray-400 font-normal md:before:content-['•'] md:before:mr-2 md:before:text-gray-300">
                                                {activeConversation.email}
                                            </span>
                                        )}
                                    </h3>

                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${activeConversation.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <p className="text-xs text-gray-500">
                                            {activeConversation.isOnline ? 'Aktywny teraz' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
                            {renderMessagesWithSeparators(activeConversation.msgs)}
                            <div ref={bottomRef} />
                        </div>

                        <div className="border-t border-gray-100 bg-white relative">
                            <div className={`
                                absolute bottom-full left-0 w-full bg-slate-50 border-t border-gray-200 p-3 transition-all duration-300 ease-in-out shadow-inner
                                ${showCanned ? 'translate-y-0 opacity-100 visible' : 'translate-y-4 opacity-0 invisible pointer-events-none'}
                            `}>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 ml-1">Szybkie odpowiedzi</p>
                                <div className="flex flex-wrap gap-2">
                                    {cannedResponses.map((text, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setReplyInput(text); setShowCanned(false); }}
                                            className="px-3 py-1.5 bg-white text-[#4E61F6] text-xs font-medium rounded-lg border border-indigo-100 hover:bg-[#4E61F6] hover:text-white hover:border-[#4E61F6] transition-all shadow-sm active:scale-95"
                                        >
                                            {text}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSendReply} className="p-3 md:p-4 flex gap-2 md:gap-3 items-center z-20 relative bg-white">
                                <button
                                    type="button"
                                    onClick={() => setShowCanned(!showCanned)}
                                    className={`p-2 md:p-2.5 rounded-full transition-colors flex-shrink-0 ${showCanned ? 'bg-[#4E61F6] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                    <CannedIcon />
                                </button>

                                <input
                                    type="text"
                                    className="flex-grow px-4 md:px-5 py-2 md:py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all text-sm placeholder-gray-400 min-w-0"
                                    placeholder={`Napisz odpowiedź...`}
                                    value={replyInput}
                                    onChange={e => setReplyInput(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="p-2 md:p-3 bg-[#4E61F6] text-white rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    disabled={!replyInput.trim()}
                                >
                                    <SendIcon />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50 p-4 text-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 border border-gray-100">
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </div>
                        <h2 className="text-base md:text-lg font-bold text-gray-700">Wybierz rozmowę</h2>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">Kliknij na użytkownika z listy, aby rozpocząć.</p>
                    </div>
                )}
            </div>
        </div>
    )
}