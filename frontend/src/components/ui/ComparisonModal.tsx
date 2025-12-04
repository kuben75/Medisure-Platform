import type {IComparisonModalProps} from "../../types/ui.types.ts"
import Modal from "./Modal.tsx"
import Button from "./Button.tsx"
const CheckIcon = () => <span className="text-green-500 font-bold text-xl">✓</span>;
const CrossIcon = () => <span className="text-red-300 font-bold text-xl">-</span>
export default function ComparisonModal({isOpen, onClose, packages}: IComparisonModalProps) {
    if (packages.length === 0) return null
    let modalWidthClass
   switch (packages.length) {
         case 2: modalWidthClass = "max-w-4xl"
             break
         case 3: modalWidthClass = "max-w-5xl"
             break
         case 4: modalWidthClass = "max-w-6xl"
             break
         case 5: modalWidthClass = "max-w-7xl"
             break
         case 6: modalWidthClass = "max-w-[80vw]"
             break
         default: modalWidthClass = "max-w-[95vw]"
             break
   }
    const labelCellClass = "p-4 text-sm font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[150px]";

    const dataCellClass = "p-4 text-sm text-gray-700 border-b border-gray-200 text-center min-w-[200px] border-l border-gray-100";
    return(
        <Modal isOpen={isOpen} onClose={onClose} className={modalWidthClass}>
            <div className="w-full flex flex-col h-full lg:overflow-x-hidden">

                <div className="text-center pb-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Porównanie ofert
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Wybrałeś {packages.length} pakiety do zestawienia
                    </p>
                </div>

                <div className="w-full overflow-x-auto py-5 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr>
                            <th className={`${labelCellClass} bg-white align-bottom pb-6 text-gray-400 uppercase text-xs`}>
                                Cecha / Pakiet
                            </th>

                            {packages.map(pkg => (
                                <th key={pkg.id} className="p-4 border-b-2 border-[#4E61F6] bg-white text-center min-w-[200px] align-bottom pb-6 relative">
                                    {pkg.isFeatured && (
                                        <span className="hidden md:none md:absolute md:top-0 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bg-yellow-100 md:text-yellow-800 md:text-[10px] md:font-bold md:px-2 md:py-0.5 md:rounded-full md:uppercase">
                                                Polecany
                                            </span>
                                    )}
                                    <div className="font-bold text-lg text-gray-900 leading-tight mb-1">
                                        {pkg.name}
                                    </div>
                                    <div className="text-[#4E61F6] font-bold text-2xl">
                                        {pkg.price}
                                    </div>
                                    <div className="text-xs text-gray-400 font-normal">/ miesiąc</div>
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        <tr className="hover:bg-blue-50/30 transition-colors group">
                            <td className={labelCellClass}>Kategoria</td>
                            {packages.map(pkg => (
                                <td key={pkg.id} className={`${dataCellClass} font-medium text-blue-600 group-hover:bg-blue-50/30`}>
                                    {pkg.category}
                                </td>
                            ))}
                        </tr>

                        <tr className="hover:bg-blue-50/30 transition-colors group">
                            <td className={labelCellClass}>Stomatologia</td>
                            {packages.map(pkg => (
                                <td key={pkg.id} className={`${dataCellClass} group-hover:bg-blue-50/30`}>
                                    {pkg.hasDentalCare ? <CheckIcon /> : <CrossIcon />}
                                </td>
                            ))}
                        </tr>
                        <tr className="hover:bg-blue-50/30 transition-colors group">
                            <td className={labelCellClass}>Szpital</td>
                            {packages.map(pkg => (
                                <td key={pkg.id} className={`${dataCellClass} group-hover:bg-blue-50/30`}>
                                    {pkg.hasHospitalization ? <CheckIcon /> : <CrossIcon />}
                                </td>
                            ))}
                        </tr>
                        <tr className="hover:bg-blue-50/30 transition-colors group">
                            <td className={labelCellClass}>Rehabilitacja</td>
                            {packages.map(pkg => (
                                <td key={pkg.id} className={`${dataCellClass} group-hover:bg-blue-50/30`}>
                                    {pkg.hasRehabilitation ? <CheckIcon /> : <CrossIcon />}
                                </td>
                            ))}
                        </tr>

                        <tr className="hover:bg-blue-50/30 transition-colors group">
                            <td className={labelCellClass}>Liczba specjalistów</td>
                            {packages.map(pkg => (
                                <td key={pkg.id} className={`${dataCellClass} font-bold text-gray-800 group-hover:bg-blue-50/30`}>
                                    {pkg.specialistsCount}
                                </td>
                            ))}
                        </tr>
                        <tr className="hover:bg-blue-50/30 transition-colors group">
                            <td className={labelCellClass}>Liczba placówek</td>
                            {packages.map(pkg => (
                                <td key={pkg.id} className={`${dataCellClass} font-bold text-gray-800 group-hover:bg-blue-50/30`}>
                                    {pkg.facilitiesCount}
                                </td>
                            ))}
                        </tr>

                        <tr className="bg-yellow-50/30 hover:bg-yellow-50 transition-colors group border-t-2 border-gray-100">
                            <td className={`${labelCellClass} bg-yellow-50/50`}>Ocena użytkowników</td>
                            {packages.map(pkg => (
                                <td key={pkg.id} className={`${dataCellClass} bg-yellow-50/30 group-hover:bg-yellow-50`}>
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-yellow-500 font-bold text-lg">★ {pkg.averageRating.toFixed(1)}</span>
                                        <span className="text-xs text-gray-400">({pkg.reviews} opinii)</span>
                                    </div>
                                </td>
                            ))}
                        </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 flex justify-end pt-4 border-t border-gray-200">
                    <Button variant="primary" onClick={onClose} className="!px-8">
                        Zamknij porównanie
                    </Button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 5px; border: 2px solid #f8fafc; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </Modal>
    )
}