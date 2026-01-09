import { useState } from 'react';
import ChevronDownIcon from "../../icons/ChevronDownIcon.tsx";
import { LevelBadge, LogDetails } from "./LogUiComponents.tsx";
import type { ISystemLog } from "../../../types/dashboard.types.ts";

export const LogCardMobile = ({ log }: { log: ISystemLog }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-3">
            <div className="flex justify-between items-start mb-3" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString('pl-PL')}</span>
                    <h4 className="font-bold text-gray-800 text-sm">{log.action}</h4>
                </div>
                <LevelBadge level={log.level} />
            </div>

            <div className="flex justify-between items-center text-xs text-gray-600 mb-3 border-t border-gray-100 pt-2">
                <span className="font-semibold">Użytkownik:</span>
                <span>{log.user}</span>
            </div>

            <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-500 uppercase text-[10px]">Treść</span>
                    <ChevronDownIcon className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
                <p className={`font-mono break-words ${isExpanded ? '' : 'truncate'}`}>{log.description}</p>
            </div>

            {isExpanded && <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in"><LogDetails log={log} /></div>}
        </div>
    )
}