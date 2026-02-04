import type {IIconProps} from "../../types/ui.types.ts";

export default function ToothIcon({className}: IIconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-3.5 h-3.5"}>
            <path
                d="M19.7999 5.2C19.1999 3.3 17.3999 2 15.2999 2C13.7999 2 12.4999 2.7 11.7999 3.7C11.0999 2.7 9.79991 2 8.29991 2C6.19991 2 4.39991 3.3 3.79991 5.2C2.29991 9.7 2.99991 16.7 6.29991 20.7C6.59991 21.1 7.19991 21.2 7.69991 20.8L10.7999 18.5C11.3999 18 12.2999 18 12.8999 18.5L15.9999 20.8C16.4999 21.2 17.0999 21 17.3999 20.7C20.6999 16.7 21.3999 9.7 19.7999 5.2Z"/>
        </svg>
    )
}