import {useState} from 'react';
import ChevronDownIcon from "../../icons/ChevronDownIcon.tsx";
import {formatLogDate, LevelBadge, LogDetails} from "./LogUiComponents.tsx";
import type {ISystemLog} from "../../../types/dashboard.types.ts";

export const LogRowDesktop = ({log}: { log: ISystemLog }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const {day, time} = formatLogDate(log.timestamp);

    return (
        <>
            <tr onClick={() => setIsExpanded(!isExpanded)}
                className={`cursor-pointer transition-all border-b border-gray-100 hover:bg-blue-50/30 ${isExpanded ? 'bg-blue-50/50' : ''}`}>
                <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700 font-mono">{day}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{time}</span>
                    </div>
                </td>
                <td className="px-4 py-4"><LevelBadge level={log.level}/></td>
                <td className="px-4 py-4 truncate" title={log.action}>
                    <span className="font-semibold text-gray-700 text-sm">{log.action}</span>
                </td>
                <td className="px-4 py-4 truncate">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-xs truncate">{log.user}</span>
                        {log.userId && <span
                            className="text-[10px] text-gray-400 font-mono truncate">{log.userId.substring(0, 8)}...</span>}
                    </div>
                </td>
                <td className="px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-600 truncate max-w-[300px]">{log.description}</p>
                        <ChevronDownIcon
                            className={`w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}/>
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-50/50 animate-fade-in">
                    <td colSpan={5} className="px-6 py-4 border-b border-gray-200">
                        <LogDetails log={log}/>
                    </td>
                </tr>
            )}
        </>
    );
};