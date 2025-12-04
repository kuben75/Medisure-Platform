import  { useState } from 'react';
import { useUserNotifications, type INotification } from '../../context/UserNotificationsContext.tsx';
import Button from './Button.tsx';

const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#4E61F6]"><path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 7.5h.008v.008H12V7.5z" /></svg>;

export default function NotificationsPanel() {
    const { notifications, markAsRead, markAllAsRead } = useUserNotifications();
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const selectedNotification = notifications.find(n => n.id === selectedId);

    const handleSelect = (n: INotification) => {
        setSelectedId(n.id)
        if (!n.isRead) markAsRead(n.id)
    }

    return (
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col md:flex-row h-[600px]">

            <div className="w-full md:w-1/3 border-r border-gray-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center flex-col">
                    <h3 className="font-bold text-gray-800">Powiadomienia</h3>
                    <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">Oznacz wszystkie</button>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">Brak powiadomień</div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => handleSelect(n)}
                                className={`p-4 cursor-pointer border-b border-gray-100 transition-colors hover:bg-white relative ${selectedId === n.id ? 'bg-white border-l-4 border-l-[#4E61F6]' : ''} ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{n.title}</h4>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{n.message}</p>
                                {!n.isRead && <div className="absolute top-4 right-2 w-2 h-2 bg-red-500 rounded-full"></div>}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="w-full md:w-2/3 flex flex-col bg-white p-8">
                {selectedNotification ? (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                <BellIcon />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedNotification.title}</h2>
                                <p className="text-sm text-gray-500">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {selectedNotification.message}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button variant="primary"  onClick={() => setSelectedId(null)} className="!py-1 !px-2 !text-sm">Wróć do listy</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <InfoIcon />
                        </div>
                        <p>Wybierz powiadomienie z listy, aby zobaczyć szczegóły.</p>
                    </div>
                )}
            </div>
        </div>
    );
}