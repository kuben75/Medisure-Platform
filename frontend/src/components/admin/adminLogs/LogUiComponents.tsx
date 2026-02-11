import type {ISystemLog} from "../../../types/dashboard.types.ts";

export const formatLogDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        day: date.toLocaleDateString('pl-PL', {day: '2-digit', month: '2-digit', year: 'numeric'}),
        time: date.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit', second: '2-digit'})
    };
};

export const LevelBadge = ({level}: { level: string }) => {
    const base = "px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide inline-block";
    switch (level) {
        case 'Error':
            return <span className={`${base} bg-red-50 text-red-700 border-red-200`}>Error</span>;
        case 'Warning':
            return <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}>Warning</span>;
        case 'Security':
            return <span className={`${base} bg-purple-50 text-purple-700 border-purple-200`}>Security</span>;
        case 'Success':
            return <span className={`${base} bg-green-50 text-green-700 border-green-200`}>Success</span>;
        default:
            return <span className={`${base} bg-blue-50 text-blue-700 border-blue-200`}>Info</span>;
    }
};

export const LogDetails = ({log}: { log: ISystemLog }) => (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-xs font-mono text-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 pb-2 border-b border-gray-100">
            <div><span className="text-gray-400">ID:</span> {log.id}</div>
            <div><span className="text-gray-400">User ID:</span> {log.userId || '-'}</div>
        </div>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{log.description}</p>
    </div>
);