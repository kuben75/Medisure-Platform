import {Avatar} from "../../ui/ChatUiComponents.tsx";
import {formatTime} from "../../../utils/FormatTime.tsx";
import type {IProps} from "../../../types/chat.types.ts";

export const AdminChatSidebar = ({ conversations, selectedEmail, onSelect, searchTerm, setSearchTerm, filter, setFilter }: IProps) => {
    return (
        <div className={`w-full md:w-[320px] border-r border-gray-200 bg-white flex-col flex-shrink-0 ${selectedEmail ? 'hidden md:flex' : 'flex'}`}>
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
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs uppercase tracking-widest mt-10">
                        Brak wyników
                    </div>
                ) : (
                    conversations.map(c => {
                        const isSelected = selectedEmail === c.email;
                        const hasUnread = c.unread > 0;
                        const containerClass = isSelected ? 'bg-blue-50 border-l-[#4E61F6]' : hasUnread ? 'bg-white border-l-transparent hover:bg-gray-50' : 'bg-gray-50/40 border-l-transparent hover:bg-gray-100 grayscale-[0.3] opacity-85';

                        return (
                            <div
                                key={c.email}
                                onClick={() => onSelect(c.email)}
                                className={`p-3 cursor-pointer flex gap-3 border-l-[3px] border-b border-gray-100 transition-all relative ${containerClass}`}
                            >
                                <div className="relative flex-shrink-0">
                                    <Avatar name={c.displayName} size="md" />
                                    {c.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                                </div>
                                <div className="overflow-hidden flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <span className={`text-sm truncate mr-2 ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}>
                                            {c.displayName}
                                        </span>
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
    )
}