import type {ReactNode} from "react";

export const StatCard = ({title, value, icon, colorClass}: {
    title: string;
    value: number | string;
    icon: ReactNode;
    colorClass: string;
}) => (
    <div className={`bg-white p-6 rounded-xl shadow border border-gray-200 flex items-center space-x-4 ${colorClass}`}>
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-opacity-20">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);