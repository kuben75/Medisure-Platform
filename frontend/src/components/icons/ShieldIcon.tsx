import type {IconProps} from "../../types/ui.types.ts";

export default function ShieldIcon({className}: IconProps) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>

    )
}