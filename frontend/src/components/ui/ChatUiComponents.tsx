
export const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
)

export const CheckIcon = ({ double = false, className = "w-3 h-3" }: { double?: boolean, className?: string }) => (
    <div className="flex -space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {double && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
        )}
    </div>
)

export const Avatar = ({ name, size = "md", className = "" }: { name: string, size?: "sm" | "md" | "lg", className?: string }) => {
    const safeName = (name || "").trim() || "?"

    let initials = ""
    if (safeName.includes("@")) {
        initials = safeName.substring(0, 2).toUpperCase()
    } else {
        initials = safeName
            .split(' ')
            .filter(n => n.length > 0)
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base"
    }

    const colors = [
        'from-blue-500 to-blue-600',
        'from-violet-500 to-violet-600',
        'from-fuchsia-500 to-fuchsia-600',
        'from-emerald-500 to-emerald-600',
        'from-amber-500 to-amber-600',
        'from-rose-500 to-rose-600',
    ]

    let hash = 0;
    for (let i = 0; i < safeName.length; i++) {
        hash = safeName.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colorIndex = Math.abs(hash) % colors.length

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0 border-2 border-white ring-1 ring-gray-100 ${className}`}>
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
    );
};

interface ChatBubbleProps {
    message: string;
    isMe: boolean;
    timestamp: Date;
    senderName?: string;
    isRead?: boolean;
}

export const ChatBubble = ({ message, isMe, timestamp, senderName, isRead }: ChatBubbleProps) => {
    return (
        <div className={`flex w-full mb-3 ${isMe ? 'justify-end' : 'justify-start'} group animate-fade-in-up`}>
            {!isMe && senderName && (
                <div className="mr-2 flex-shrink-0 self-end mb-5">
                    <Avatar name={senderName} size="sm"/>
                </div>
            )}

            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                    className={`px-4 py-2.5 text-[14px] leading-relaxed relative shadow-sm transition-all
                    ${isMe
                        ? 'bg-[#4E61F6] text-white rounded-2xl rounded-tr-sm'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                    }`}
                >
                    {message}
                </div>

                <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-gray-400">
                        {timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </span>
                    {isMe && (
                        <div
                            className={`transition-colors duration-300 ${isRead ? 'text-[#4E61F6]' : 'text-gray-300'}`}>
                            <CheckIcon double={true}/>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export const QuickReplies = ({onSelect}: { onSelect: (text: string) => void }) => {
    const options = ["👋 Dzień dobry", "💰 Cennik", "📅 Umów wizytę", "📍 Gdzie jesteście?"];

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => onSelect(opt)}
                    className="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                >
                    {opt}
                </button>
            ))}
        </div>
    );
};