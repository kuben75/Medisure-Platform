import Modal from '../ui/Modal.tsx'
import Button from '../ui/Button.tsx'
import { SPECIALISTS_LIST } from '../../constants/specialists.tsx'
import type {ISpecialistsListModalProps} from "../../types/specialists.types.ts"
import CheckIcon from "../icons/CheckIcon.tsx";

const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>;

export default function SpecialistsListModal({ isOpen, onClose, packageName, limit }: ISpecialistsListModalProps) {
    if (!isOpen) return null;

    const total = SPECIALISTS_LIST.length;
    const percentage = Math.round((limit / total) * 100);

    let progressColor = "bg-blue-500";
    if (percentage < 30) progressColor = "bg-yellow-400";
    else if (percentage > 80) progressColor = "bg-green-500";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                    Zakres specjalistów
                </h2>
                <p className="text-lg text-[#4E61F6] font-semibold mt-1">{packageName}</p>
            </div>

            {/* Pasek Postępu */}
            <div className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between text-sm mb-3 font-medium">
                    <span className="text-gray-600">Dostępność specjalizacji</span>
                    <span className={`font-bold ${percentage > 80 ? 'text-green-600' : 'text-[#4E61F6]'}`}>
                        {percentage}% ({limit}/{total})
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300/50">
                    <div
                        className={`h-4 rounded-full transition-all duration-1000 ease-out ${progressColor} relative`}
                        style={{ width: `${percentage}%` }}
                    >
                        {/* Efekt połysku na pasku */}
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20"></div>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                    Im wyższy pakiet, tym szerszy dostęp do lekarzy bez skierowania.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[55vh] overflow-y-auto p-2 custom-scrollbar">
                {SPECIALISTS_LIST.map((spec, idx) => {
                    const isAvailable = idx < limit;

                    return (
                        <div
                            key={idx}
                            className={`
                                relative p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-300 group
                                ${isAvailable
                                ? 'bg-white border-blue-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-300'
                                : 'bg-gray-50 border-gray-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-80'
                            }
                            `}
                        >
                            {/* Ikona */}
                            <div className={`text-3xl mb-3 transition-transform group-hover:scale-110 ${isAvailable ? '' : 'opacity-50'}`}>
                                {spec.icon}
                            </div>

                            {/* Nazwa */}
                            <span className={`text-xs font-bold leading-tight mb-2 ${isAvailable ? 'text-gray-800' : 'text-gray-500'}`}>
                                {spec.name}
                            </span>

                            {/* Status */}
                            <div className="mt-auto pt-2 border-t border-gray-100/50 w-full flex justify-center">
                                {isAvailable ? (
                                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                                        <CheckIcon className="w-6 h-6" /> Dostępny
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium bg-gray-200 px-2 py-0.5 rounded-full">
                                        <LockIcon /> Zablokowany
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <Button variant="outline" onClick={onClose} className="!px-10 shadow-sm hover:bg-gray-50 border-gray-300 text-gray-600">
                    Zamknij listę
                </Button>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; border: 2px solid #f1f5f9; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </Modal>
    );
}