import type {IIconProps} from "../../types/ui.types.ts";

export default function HospitalIcon({className}: IIconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
             className={className || "w-3.5 h-3.5"}>
            <path fillRule="evenodd"
                  d="M4.5 2.25a.75.75 0 01.75.75v2.25h13.5V3a.75.75 0 011.5 0v2.25h1.5a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75h1.5V3a.75.75 0 01.75-.75zm14.25 4.5H5.25v13.5h13.5V6.75zm-9 3.75a.75.75 0 01.75.75v2.25h2.25a.75.75 0 010 1.5h-2.25v2.25a.75.75 0 01-1.5 0v-2.25H7.5a.75.75 0 010-1.5h2.25v-2.25a.75.75 0 01.75-.75z"
                  clipRule="evenodd"/>
        </svg>
    );
}