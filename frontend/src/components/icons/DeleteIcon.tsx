import type {IIconProps} from "../../types/ui.types.ts";

export default function DeleteIcon({className}: IIconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
             className={className}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.54 0c-.342.052-.682.107-1.022.166m11.522 0l-1.06-1.06a1.5 1.5 0 00-2.12 0l-1.06 1.06m-7.5 0l-1.06-1.06a1.5 1.5 0 00-2.12 0l-1.06 1.06m11.522 0l-1.06 1.06a1.5 1.5 0 00-2.12 0l-1.06 1.06"/>
        </svg>
    );
}