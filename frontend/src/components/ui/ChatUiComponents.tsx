import {useMemo} from 'react';
import type {IChatBubbleProps} from "../../types/chat.types.ts";
import {CheckChatIcon} from "../icons/CheckChatIcon.tsx";
import RobotIcon from "../icons/RobotIcon.tsx";
import {AVATAR_COLORS, QUICK_OPTIONS, SIZE_CLASSES} from "../../constants/ui.ts";
import type {IAvatarProps} from "../../types/user.types.ts";


export const Avatar = ({ name, size = "md", className = "" }: IAvatarProps) => {
    const safeName = (name || "").trim() || "?"
    const isSystem = safeName.toLowerCase() === "system"
    const colorClass = useMemo(() => {
        if (isSystem) return "bg-indigo-600 border-indigo-100";

        let hash = 0;
        for (let i = 0; i < safeName.length; i++) {
            hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
        }
        return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    }, [safeName, isSystem]);

    const initials = useMemo(() => {
        if (isSystem) return null;
        if (safeName.includes("@")) return safeName.substring(0, 2).toUpperCase();

        return safeName
            .split(' ')
            .filter(n => n.length > 0)
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }, [safeName, isSystem])

    if (isSystem) {
        return (
            <div className={`${SIZE_CLASSES[size]} rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm flex-shrink-0 border-2 border-white ring-1 ring-indigo-100 ${className}`}>
                <RobotIcon className={size === 'sm' ? "w-4 h-4" : "w-5 h-5"} />
            </div>
        )
    }
    return (
        <div className={`${SIZE_CLASSES[size]} rounded-full bg-gradient-to-br ${colorClass} text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0 border-2 border-white ring-1 ring-gray-100 ${className}`}>
            {initials}
        </div>
    )
}

export const DateSeparator = ({ date }: { date: Date }) => {
    const isToday = new Date().toDateString() === date.toDateString();
    const isYesterday = new Date(Date.now() - 86400000).toDateString() === date.toDateString();

    let label = date.toLocaleDateString();
    if (isToday) label = "Dzisiaj";
    else if (isYesterday) label = "Wczoraj";

    return (
        <div className="flex items-center justify-center my-4 opacity-80">
            <div className="h-[1px] bg-gray-200 w-12"></div>
            <span className="text-[10px] uppercase font-bold text-gray-400 px-3 tracking-widest">{label}</span>
            <div className="h-[1px] bg-gray-200 w-12"></div>
        </div>
    )
}

export const ChatBubble = ({ message, isMe, timestamp, senderName, isRead }: IChatBubbleProps) => {
    const isSystem = senderName === "System";

    let bubbleClass = "px-4 py-2.5 text-[14px] leading-relaxed relative shadow-sm transition-all ";

    if (isMe)
        bubbleClass += "bg-[#4E61F6] text-white rounded-2xl rounded-tr-sm";
     else if (isSystem)
        bubbleClass += "bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-2xl rounded-tl-sm";
     else
        bubbleClass += "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm";


    return (
        <div className={`flex w-full mb-3 ${isMe ? 'justify-end' : 'justify-start'} group animate-fade-in-up`}>
            {!isMe && senderName && (
                <div className="mr-2 flex-shrink-0 self-end mb-5">
                    <Avatar name={senderName} size="sm"/>
                </div>
            )}

            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                {isSystem && !isMe && (
                    <span className="text-[10px] text-indigo-500 font-bold mb-1 ml-2">Asystent Medisure</span>
                )}

                <div className={bubbleClass}>
                    {message}
                </div>

                <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-gray-400">
                        {timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </span>
                    {isMe && (
                        <div className={`transition-colors duration-300 ${isRead ? 'text-[#4E61F6]' : 'text-gray-300'}`}>
                            <CheckChatIcon double={true}/>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export const QuickReplies = ({ onSelect }: { onSelect: (text: string) => void }) => {

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
            {QUICK_OPTIONS.map((opt) => (
                <button
                    key={opt}
                    onClick={() => onSelect(opt)}
                    className="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                >
                    {opt}
                </button>
            ))}
        </div>
    )
}