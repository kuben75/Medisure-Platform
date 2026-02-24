import {useMemo, useState} from "react";
import Modal from './Modal.tsx';
import Button from '../Button.tsx';
import {SPECIALISTS_LIST} from '../../../constants/specialists.tsx';
import CheckIcon from "../../icons/CheckIcon.tsx";
import type {ISpecialistsListModalProps} from "../../../types/specialists.types.ts";
import LockIcon from "../../icons/LockIcon.tsx";
import FilterIcon from "../../icons/FilterIcon.tsx";

export default function SpecialistsListModal({
                                                 isOpen,
                                                 onClose,
                                                 packageName,
                                                 includedSpecializations
                                             }: ISpecialistsListModalProps) {
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

    const allowedCategories = useMemo(() => {
        if (!includedSpecializations) {
            return [];
        }
        return includedSpecializations.split(';').map(c => c.trim());
    }, [includedSpecializations]);

    const filteredAndSortedList = useMemo(() => {
        let list = [...SPECIALISTS_LIST];

        const isAvailable = (specCategory: string) => allowedCategories.includes(specCategory);

        if (showOnlyAvailable) {
            list = list.filter(s => isAvailable(s.category));
        }

        return list.sort((a, b) => {
            const aAv = isAvailable(a.category);
            const bAv = isAvailable(b.category);

            if (aAv && !bAv) {
                return -1;
            }
            if (!aAv && bAv) {
                return 1;
            }
            return a.category.localeCompare(b.category);
        });
    }, [allowedCategories, showOnlyAvailable]);

    if (!isOpen) {
        return null;
    }

    const total = SPECIALISTS_LIST.length;
    const availableCount = SPECIALISTS_LIST.filter(s => allowedCategories.includes(s.category)).length;
    const percentage = total > 0 ? Math.round((availableCount / total) * 100) : 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl">
            <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Katalog Specjalistów
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">Pakiet:</span>
                        <span
                            className="text-sm font-bold text-[#4E61F6] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {packageName}
                        </span>
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pokrycie</p>
                        <p className={`text-2xl font-bold leading-none ${percentage > 80 ? 'text-green-600' : 'text-[#4E61F6]'}`}>
                            {percentage}%
                        </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 self-center"></div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dostępni</p>
                        <p className="text-2xl font-bold text-gray-800 leading-none">
                            {availableCount}<span className="text-sm text-gray-400 font-normal">/{total}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
                        ${showOnlyAvailable
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }
                    `}
                >
                    <FilterIcon/>
                    {!showOnlyAvailable ? 'Pokaż wszystkich' : 'Pokaż tylko dostępnych'}
                </button>
            </div>

            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1 custom-scrollbar">
                {filteredAndSortedList.map((spec) => {
                    const isAvailable = allowedCategories.includes(spec.category);

                    return (
                        <div
                            key={spec.id}
                            className={`
                                flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden
                                ${isAvailable
                                ? 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5'
                                : 'bg-slate-50 border-gray-100 opacity-70 hover:opacity-100'
                            }
                            `}
                        >
                            <div className="relative flex-shrink-0">
                                <div
                                    className={`w-14 h-14 rounded-full overflow-hidden border ${isAvailable ? 'border-gray-100' : 'border-gray-200 grayscale'}`}>
                                    <img
                                        src={spec.imageUrl}
                                        alt={spec.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                {isAvailable && (
                                    <div
                                        className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full border-2 border-white">
                                        <CheckIcon className="w-3 h-3"/>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className={`text-[10px] font-bold uppercase tracking-wide truncate mb-0.5 ${isAvailable ? 'text-indigo-600' : 'text-gray-400'}`}>
                                        {spec.category}
                                    </p>
                                    {!isAvailable && <LockIcon className="w-4 h-4 text-gray-400"/>}
                                </div>

                                <h3 className={`text-sm font-bold truncate leading-tight ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {spec.title} {spec.name}
                                </h3>

                                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                    {spec.description}
                                </p>

                                <div className="mt-3 flex items-center gap-2">
                                    {isAvailable ? (
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                                            W cenie pakietu
                                        </span>
                                    ) : (
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                            Niedostępny
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={onClose}
                        className="px-6 border-gray-300 hover:bg-gray-50 text-gray-700">
                    Zamknij
                </Button>
            </div>
        </Modal>
    )
}