import type {IconProps} from "../../types/ui.types.ts";

export default function StethoscopeIcon({className}: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4.8 2.3A.3.3 0 1 0 5.4 2a.3.3 0 0 0-.6.3"/>
            <path d="M18.6 2.3a.3.3 0 1 0 .6-.3.3.3 0 0 0-.6.3"/>
            <path d="M5 2.5a4.5 4.5 0 0 1 9 0v6.5a4.5 4.5 0 0 1-4.5 4.5v0a4.5 4.5 0 0 1-4.5-4.5V2.5Z"/>
            <path d="M8 15.5v5a2 2 0 0 0 2 2v0a2 2 0 0 0 2-2v-5"/>
            <path d="M14 2.5a4.5 4.5 0 0 1 4.5 4.5v0a4.5 4.5 0 0 1-4.5 4.5"/>
        </svg>
    )
}
