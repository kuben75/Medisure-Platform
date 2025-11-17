import { useState } from "react";
import ChevronDownIcon from "../icons/ChevronDownIcon.tsx";
type AccordionProps = {
    question: string;
    answer: string;
}

export default function Accordion({question, answer}: AccordionProps) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 py-4">
            <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center text-left text-gray-800 font-semibold hover:text-blue-600 focus:outline-none hover:cursor-pointer">
                <span>{question}</span>
                <ChevronDownIcon className={`transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                <p className="text-gray-600">{answer}</p>
            </div>
        </div>
    )
}