import { useState } from 'react';
import Button from '../ui/Button.tsx';
import ComparisonModal from './ComparisonModal.tsx';
import {useComparison} from "../../hooks/useComparison.tsx";

export default function ComparisonBar() {
    const { selectedPackages, removeFromComparison, clearComparison } = useComparison();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (selectedPackages.length === 0) return null;

    return (
        <>
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 z-40 animate-slide-up">
                <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">

                    <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-1">
                        <span className="text-gray-500 font-medium text-sm uppercase tracking-wide mr-2">
                            Porównaj ({selectedPackages.length}/3):
                        </span>

                        {selectedPackages.map(pkg => (
                            <div key={pkg.id} className="flex items-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 min-w-max">
                                <span className="text-sm text-blue-800 font-semibold mr-2">{pkg.name}</span>
                                <button
                                    onClick={() => removeFromComparison(pkg.id)}
                                    className="text-blue-300 hover:text-red-500 font-bold text-lg leading-none transition-colors px-1"
                                    title="Usuń"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 flex-shrink-0">
                        <button
                            onClick={clearComparison}
                            className="text-gray-400 hover:text-gray-600 text-sm underline px-2"
                        >
                            Wyczyść
                        </button>

                        <Button
                            variant="primary"
                            className="!py-2 !px-6 !text-sm shadow-none"
                            disabled={selectedPackages.length < 2}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Porównaj teraz
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
    );
}