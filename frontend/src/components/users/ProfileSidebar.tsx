import {useState} from 'react';
import EditIcon from '../icons/EditIcon.tsx';
import LockIcon from '../icons/LockIcon.tsx';
import ShieldIcon from '../icons/ShieldIcon.tsx';
import BriefcaseIcon from '../icons/BriefcaseIcon.tsx';
import HeartIcon from '../icons/HeartIcon.tsx';
import BellIcon from '../icons/BellIcon.tsx';
import HealthPrevention from '../ui/HealthPrevention.tsx';
import type {IProfileSidebarProps} from "../../types/ui.types.ts";
import ChevronIcon from "../icons/ChevronIcon.tsx";


export default function ProfileSidebar({
                                           user,
                                           activeTab,
                                           setActiveTab,
                                           unreadCount,
                                           onEditProfile,
                                           onChangePassword,
                                           onOpen2FA
                                       }: IProfileSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="md:col-span-4 lg:col-span-3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
            <div className="p-5 border-b border-slate-200">
                <div
                    className="flex justify-between items-center cursor-pointer md:cursor-default"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Twoje dane</h3>
                    <div className="md:hidden">
                        <ChevronIcon
                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>
                    </div>
                </div>

                <div
                    className={`mt-4 space-y-4 transition-all overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100'}`}>
                    <div className="flex gap-2 mb-2">
                        <button onClick={onEditProfile}
                                className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:text-[#4E61F6] flex gap-1">
                            <EditIcon className="w-3 h-3"/> Edytuj
                        </button>
                        <button onClick={onChangePassword}
                                className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:text-red-500 flex gap-1">
                            <LockIcon className="w-3 h-3"/> Hasło
                        </button>
                    </div>

                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Email</p><p
                        className="font-medium text-sm truncate">{user?.email}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Telefon</p><p
                        className="font-medium text-sm">{user?.phoneNumber || '-'}</p></div>

                    <div className="pt-3 border-t border-slate-200">
                        <div
                            className={`flex items-center gap-2 text-xs font-bold ${user?.twoFactorEnabled ? 'text-green-600' : 'text-orange-500'}`}>
                            <ShieldIcon
                                className="w-3 h-3"/> {user?.twoFactorEnabled ? '2FA Aktywne' : '2FA Nieaktywne'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-2 space-y-1 sticky top-0">
                <MenuButton icon={<BriefcaseIcon className="w-5 h-5"/>} label="Twoje Pakiety"
                            isActive={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')}/>
                <MenuButton icon={<HeartIcon className="w-5 h-5" filled={false}/>} label="Ulubione Oferty"
                            isActive={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')}/>
                <MenuButton icon={<BellIcon className="w-5 h-5"/>} label="Powiadomienia"
                            isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}
                            badge={unreadCount}/>
                <MenuButton icon={<ShieldIcon className="w-5 h-5"/>} label="Bezpieczeństwo" onClick={onOpen2FA}/>
            </div>

            <div className="p-4 md:block hidden">
                <HealthPrevention birthDate={user?.birthDate ?? undefined}/>
            </div>
        </div>
    );
}

const MenuButton = ({icon, label, isActive, onClick, badge}: any) => (
    <button onClick={onClick}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium ${isActive ? 'bg-white text-[#4E61F6] shadow-sm border border-gray-100 font-bold' : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'}`}>
        {icon} {label}
        {badge > 0 && <span
            className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{badge}</span>}
    </button>
);