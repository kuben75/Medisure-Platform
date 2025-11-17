import type {TModalProps} from "../../types/types.ts";
import XIcon from "../icons/XIcon.tsx";

export default function Modal({isOpen, onClose, children}: TModalProps) {
    if (!isOpen)
        return null

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={e => e.stopPropagation()} style={{animation: 'fadeInScale 0.3s forwards'}}>
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors hover:cursor-pointer"
                        onClick={onClose}>
                    <XIcon className="w-7 h-7"/>
                </button>
                <div>
                    {children}
                </div>
            </div>
        </div>
    )
}
