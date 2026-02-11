import type {IIconProps} from "../../types/ui.types.ts";

export default function GroupIcon({className}: IIconProps) {
    return (
        <svg className={className || "w-8 h-8 text-green-600"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.502.152a3 3 0 01-4.682-2.72M10.5 18.72a9.094 9.094 0 013.741-.479M6.75 12.75a3 3 0 11-6 0 3 3 0 016 0zM17.25 12.75a3 3 0 11-6 0 3 3 0 016 0zM10.5 6a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
    );
}