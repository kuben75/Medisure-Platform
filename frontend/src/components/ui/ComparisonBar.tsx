import { useState } from 'react';
import Button from '../ui/Button.tsx';
import ComparisonModal from './modals/ComparisonModal.tsx';
import {useComparison} from "../../hooks/useComparison.ts";

export default function ComparisonBar() {
    const { selectedPackages, removeFromComparison, clearComparison, limit } = useComparison()
    const [isModalOpen, setIsModalOpen] = useState(false)

    if (selectedPackages.length === 0) return null

    return (
        <>
            <div
                className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 z-40 animate-slide-up">
                <div
                    className="container mx-auto max-w-7xl flex flex-col xl:flex-row items-center justify-between gap-6">

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full">

                        <div className="flex-shrink-0">
                            <span
                                className="text-gray-500 font-bold text-xs uppercase tracking-wide bg-gray-100 px-3 py-1 rounded-full">
                                Wybrano: <span className="text-blue-600">{selectedPackages.length}</span>/{limit}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
                            {selectedPackages.map(pkg => (
                                <div
                                    key={pkg.id}
                                    className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 shadow-sm min-w-[140px] transition-all hover:border-blue-300"
                                >
                                    <span className="text-sm text-blue-800 font-semibold truncate mr-2"
                                          title={pkg.name}>
                                        {pkg.name}
                                    </span>
                                    <button
                                        onClick={() => removeFromComparison(pkg.id)}
                                        className="text-blue-300 hover:text-red-500 font-bold text-lg leading-none transition-colors px-1 flex-shrink-0 focus:outline-none"
                                        title="Usuń z porównania"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="flex gap-3 flex-shrink-0 border-t xl:border-t-0 xl:border-l border-gray-100 pt-4 xl:pt-0 xl:pl-6 w-full xl:w-auto justify-end">
                        <button
                            onClick={clearComparison}
                            className="text-gray-400 hover:text-gray-600 text-sm underline px-3 transition-colors"
                        >
                            Wyczyść
                        </button>

                        <Button
                            variant="primary"
                            className="!py-2.5 !px-6 !text-sm shadow-md whitespace-nowrap"
                            disabled={selectedPackages.length < 2}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Porównaj teraz ({selectedPackages.length})
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
            `}</style>

            <ComparisonModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                packages={selectedPackages}
            />
        </>
    )
}