import Modal from './Modal.tsx'
import Button from '../Button.tsx'
import { SPECIALISTS_LIST } from '../../../constants/specialists.tsx'
import CheckIcon from "../../icons/CheckIcon.tsx";
import { useMemo } from "react";
import type {ISpecialistsListModalProps} from "../../../types/specialists.types.ts";

const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>;

export default function SpecialistsListModal({ isOpen, onClose, packageName }: ISpecialistsListModalProps) {
    if (!isOpen) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const sortedSpecialists = useMemo(() => {
        const list = [...SPECIALISTS_LIST];

        return list.sort((a, b) => {
            const aAvailable = a.availableInPackages.includes(packageName);
            const bAvailable = b.availableInPackages.includes(packageName);

            if (aAvailable && !bAvailable) return -1;
            if (!aAvailable && bAvailable) return 1;
            return 0;
        });
    }, [packageName]);

    const total = SPECIALISTS_LIST.length;
    const availableCount = SPECIALISTS_LIST.filter(s => s.availableInPackages.includes(packageName)).length;
    const percentage = Math.round((availableCount / total) * 100);

    let progressColor = "bg-blue-500";
    if (percentage < 30) progressColor = "bg-yellow-400";
    else if (percentage > 80) progressColor = "bg-green-500";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-6xl">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                    Zakres specjalistów
                </h2>
                <p className="text-lg text-[#4E61F6] font-semibold mt-1">{packageName}</p>
            </div>

            <div className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between text-sm mb-3 font-medium">
                    <span className="text-gray-600">Dostępność specjalizacji w tym pakiecie</span>
                    <span className={`font-bold ${percentage > 80 ? 'text-green-600' : 'text-[#4E61F6]'}`}>
                        {percentage}% ({availableCount}/{total})
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300/50">
                    <div
                        className={`h-4 rounded-full transition-all duration-1000 ease-out ${progressColor} relative`}
                        style={{ width: `${percentage}%` }}
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20"></div>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                    Lista zawiera wszystkich specjalistów współpracujących z Medisure. Kolorowe karty oznaczają dostępność w wybranym pakiecie.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                {sortedSpecialists.map((spec) => {
                    const isAvailable = spec.availableInPackages.includes(packageName);

                    return (
                        <div
                            key={spec.id}
                            className={`
                                relative p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-300 group
                                ${isAvailable
                                ? 'bg-white border-blue-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-300'
                                : 'bg-gray-50/50 border-gray-100 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
                            }
                            `}
                        >
                            <div className="relative mb-3">
                                <div className={`w-20 h-20 rounded-full overflow-hidden border-2 ${isAvailable ? 'border-blue-100 group-hover:border-blue-400' : 'border-gray-200'}`}>
                                    <img
                                        src={spec.imageUrl}
                                        alt={spec.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                {isAvailable && (
                                    <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                                        <CheckIcon className="w-3 h-3" />
                                    </div>
                                )}
                            </div>

                            <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isAvailable ? 'text-blue-600' : 'text-gray-400'}`}>
                                {spec.category}
                            </span>

                            <span className={`text-xs font-bold leading-tight mb-1 ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                                {spec.title} {spec.name}
                            </span>

                            <div className="mt-auto pt-3 border-t border-gray-100/50 w-full flex justify-center">
                                {isAvailable ? (
                                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                                        Dostępny
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                        <LockIcon /> Brak w pakiecie
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <Button variant="primary" onClick={onClose} className="!px-10 shadow-sm border-gray-300 ">
                    Zamknij listę
                </Button>
            </div>

        </Modal>
    )
}