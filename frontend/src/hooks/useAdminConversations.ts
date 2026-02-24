import {useMemo, useState} from 'react';
import type {IChatMessage, IUseAdminConversationsProps} from "../types/chat.types.ts";

export const useAdminConversations = ({messages, onlineUsers, userDetails}: IUseAdminConversationsProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<'all' | 'unread' | 'online'>('all');

    const conversationList = useMemo(() => {
        const groups: Record<string, {
            msgs: IChatMessage[],
            unread: number,
            lastMsg: IChatMessage,
            hasUserInteraction: boolean
        }> = {};

        messages.forEach(msg => {
            const key = (msg.type === "UserToAdmin" ? msg.user : (msg.targetUserEmail || "unknown")).toLowerCase();

            if (!key || key === "unknown" || key === "admin" || key === "system") {
                return;
            }

            if (!groups[key]) {
                groups[key] = {msgs: [], unread: 0, lastMsg: msg, hasUserInteraction: false};
            }
            groups[key].msgs.push(msg);

            if (new Date(msg.timestamp) > new Date(groups[key].lastMsg.timestamp)) {
                groups[key].lastMsg = msg;
            }
            if (msg.type === "UserToAdmin" && !msg.isRead) {
                groups[key].unread++;
            }
            if (msg.type === "UserToAdmin") {
                groups[key].hasUserInteraction = true;
            }
        });

        return Object.entries(groups)
            .map(([email, data]) => {
                const details = userDetails?.[email];
                let displayName = email;
                if (details?.firstName || details?.lastName) {
                    displayName = `${details.firstName || ''} ${details.lastName || ''}`.trim();
                }

                data.msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                return {
                    email,
                    displayName,
                    ...data,
                    isOnline: onlineUsers?.includes(email) || false
                };
            })
            .filter(c => c.hasUserInteraction)
            .sort((a, b) => new Date(b.lastMsg.timestamp).getTime() - new Date(a.lastMsg.timestamp).getTime());
    }, [messages, onlineUsers, userDetails]);

    const filteredList = useMemo(() => {
        return conversationList.filter(c => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = c.displayName.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);
            const matchesFilter = filter === 'all' ? true :
                filter === 'unread' ? c.unread > 0 :
                    filter === 'online' ? c.isOnline : true;
            return matchesSearch && matchesFilter;
        });
    }, [conversationList, searchTerm, filter]);

    return {
        conversations: conversationList,
        filteredList,
        searchTerm, setSearchTerm,
        filter, setFilter
    }
}