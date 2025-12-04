import EyeIcon from "../components/icons/EyeIcon.tsx";
import {useState} from "react";

export const SensitiveData = ({ text }: { text: string }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="flex items-center gap-2 group">
            <span className={`font-medium font-mono text-gray-800 transition-all duration-300 ${isVisible ? '' : 'blur-sm select-none'}`}>
                {text}
            </span>
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="text-gray-400 hover:text-[#4E61F6] transition-colors p-1 rounded-full hover:bg-blue-50 focus:outline-none"
                title={isVisible ? "Ukryj" : "Pokaż"}
            >
                {isVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                ) : (
                    <EyeIcon className="w-4 h-4" />
                )}
            </button>
        </div>
    )
}