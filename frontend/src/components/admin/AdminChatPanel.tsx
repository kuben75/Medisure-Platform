import  { useEffect, useState } from 'react';
import { useChat } from "../../hooks/useChat.ts";
import { useAdminConversations } from "../../hooks/useAdminConversations.ts";
import { AdminChatSidebar } from "./chat/AdminChatSidebar.tsx";
import { AdminChatWindow } from "./chat/AdminChatWindow.tsx";

export default function AdminChatPanel() {
    const { messages, sendMessageToUser, onlineUsers, userDetails, markAsRead } = useChat();

    const {
        conversations,
        filteredList,
        searchTerm, setSearchTerm,
        filter, setFilter
    } = useAdminConversations({ messages, onlineUsers, userDetails });

    const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

    useEffect(() => {
        if (selectedUserEmail) {
            const conversation = conversations.find(c => c.email === selectedUserEmail);
            if (conversation && conversation.unread > 0) {
                markAsRead(selectedUserEmail);
            }
        }
    }, [selectedUserEmail, conversations, markAsRead]);

    const activeConversation = selectedUserEmail
        ? conversations.find(c => c.email === selectedUserEmail)
        : null;

    const handleSendMessage = async (msg: string) => {
        if (selectedUserEmail) {
            await sendMessageToUser(selectedUserEmail, msg);
        }
    };

    return (
        <div className="mt-4 md:mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[25vh] md:h-[700px] font-sans">
            <AdminChatSidebar
                conversations={filteredList}
                selectedEmail={selectedUserEmail}
                onSelect={setSelectedUserEmail}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filter={filter}
                setFilter={setFilter}
            />

            <AdminChatWindow
                conversation={activeConversation}
                onSend={handleSendMessage}
                onBack={() => setSelectedUserEmail(null)}
            />
        </div>
    );
}