import React, {useEffect, useRef, useState} from 'react';
import type {IAdminChatWindowProps, IChatMessage} from "../../../types/chat.types.ts";
import {Avatar, ChatBubble, DateSeparator} from "../../ui/ChatUiComponents.tsx";
import ArrowLeftIcon from "../../icons/ArrowLeftIcon.tsx";
import {RESPONSES} from "../../../constants/panelOptions.ts";
import CannedIcon from "../../icons/CannedIcon.tsx";
import SendIcon from "../../icons/SendIcon.tsx";


export const AdminChatWindow = ({ conversation, onSend, onBack }: IAdminChatWindowProps) => {
    const [replyInput, setReplyInput] = useState("");
    const [showCanned, setShowCanned] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (conversation) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [conversation, conversation?.msgs.length]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyInput.trim()) return;
        await onSend(replyInput);
        setReplyInput("");
        setShowCanned(false);
    };

    if (!conversation) {
        return (
            <div className="hidden md:flex w-full md:w-2/3 flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50 p-4 text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 border border-gray-100">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <h2 className="text-base md:text-lg font-bold text-gray-700">Wybierz rozmowę</h2>
                <p className="text-xs md:text-sm text-gray-400 mt-1">Kliknij na użytkownika z listy, aby rozpocząć.</p>
            </div>
        );
    }

    const renderMessages = () => {
        const result = [];
        let lastDate = "";
        const msgs = conversation.msgs as IChatMessage[];

        for (let i = 0; i < msgs.length; i++) {
            const msg = msgs[i];
            const msgDate = new Date(msg.timestamp).toDateString();

            if (msgDate !== lastDate) {
                result.push(<DateSeparator key={`date-${i}`} date={new Date(msg.timestamp)} />);
                lastDate = msgDate;
            }

            const isOutgoing = msg.type === "AdminToUser";
            let senderName = isOutgoing ? "Ty" : (conversation.displayName || "User");
            if (msg.user === "System") senderName = "System (Bot)";

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
        <div className="flex w-full md:w-2/3 flex-col bg-white relative">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-[0_2px_10px_-10px_rgba(0,0,0,0.1)] z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <Avatar name={conversation.displayName} size="md" />
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 flex flex-col md:flex-row md:items-center md:gap-2">
                            <span>{conversation.displayName}</span>
                            {conversation.email !== conversation.displayName && (
                                <span className="text-xs text-gray-400 font-normal md:before:content-['•'] md:before:mr-2 md:before:text-gray-300">
                                    {conversation.email}
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${conversation.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <p className="text-xs text-gray-500">{conversation.isOnline ? 'Aktywny teraz' : 'Offline'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
                {renderMessages()}
                <div ref={bottomRef} />
            </div>

            <div className="border-t border-gray-100 bg-white relative">
                <div className={`absolute bottom-full left-0 w-full bg-slate-50 border-t border-gray-200 p-3 transition-all duration-300 ease-in-out shadow-inner ${showCanned ? 'translate-y-0 opacity-100 visible' : 'translate-y-4 opacity-0 invisible pointer-events-none'}`}>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 ml-1">Szybkie odpowiedzi</p>
                    <div className="flex flex-wrap gap-2">
                        {RESPONSES.map((text, i) => (
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

                <form onSubmit={handleSend} className="p-3 md:p-4 flex gap-2 md:gap-3 items-center z-20 relative bg-white">
                    <button type="button" onClick={() => setShowCanned(!showCanned)} className={`p-2 md:p-2.5 rounded-full transition-colors flex-shrink-0 ${showCanned ? 'bg-[#4E61F6] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <CannedIcon />
                    </button>

                    <input
                        type="text"
                        className="flex-grow px-4 md:px-5 py-2 md:py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all text-sm placeholder-gray-400 min-w-0"
                        placeholder={`Napisz odpowiedź...`}
                        value={replyInput}
                        onChange={e => setReplyInput(e.target.value)}
                    />
                    <button type="submit" className="p-2 md:p-3 bg-[#4E61F6] text-white rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0" disabled={!replyInput.trim()}>
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};