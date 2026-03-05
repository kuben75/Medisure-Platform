import ChevronDownIcon from "../icons/ChevronDownIcon.tsx";
import type {IAccordionProps} from "../../types/ui.types.ts";

export default function Accordion({question, answer, isOpen, onToggle}: IAccordionProps) {
    return (
        <div className="border-b border-gray-100 last:border-none">
            <button
                className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
                onClick={onToggle}>
                <span
                    className={`font-semibold transition-colors ${isOpen 
                        ? 'text-[#4E61F6]' 
                        : 'text-gray-700 group-hover:text-[#4E61F6]'}`}>{question}
                </span>
                <span
                    className={`ml-4 transform transition-transform duration-300 text-gray-400 ${isOpen 
                        ? 'rotate-180 text-[#4E61F6]' 
                        : ''}`}>
                    <ChevronDownIcon className="w-5 h-5"/>
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen 
                    ? 'max-h-96 opacity-100 pb-4' 
                    : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-600 text-sm leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    );
}