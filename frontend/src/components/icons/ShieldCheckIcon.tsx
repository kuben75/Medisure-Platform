import type {IconProps} from "../../types/ui.types.ts";

export default function ShieldCheckIcon({className}: IconProps) {
    return (
        <svg
            className={className || "w-6 h-6 text-indigo-400"}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 2.25l7.5 3v6.75c0 4.28-3.07 8.37-7.5 9.75-4.43-1.38-7.5-5.47-7.5-9.75v-6.75l7.5-3z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12.75l2 2 4-4"
            />
        </svg>
    );
}
