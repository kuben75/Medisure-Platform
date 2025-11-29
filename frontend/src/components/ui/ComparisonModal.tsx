import type {IComparisonModalProps} from "../../types/ui.types.ts"
import Modal from "./Modal.tsx"
import Button from "./Button.tsx"
const CheckIcon = () => <span className="text-green-500 font-bold text-xl">✓</span>;
const CrossIcon = () => <span className="text-red-300 font-bold text-xl">-</span>
export default function ComparisonModal({isOpen, onClose, packages}: IComparisonModalProps) {
    if (packages.length === 0) return null


    return(
        <Modal isOpen={isOpen} onClose={onClose} className={"max-w-5xl"}>
            <div className="w-full overflow-x-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Porównanie {packages.length} pakietów
                </h2>

                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr>
                        <th className="p-4 border-b-2 border-gray-200 bg-gray-50 w-1/4 text-gray-500 uppercase text-xs font-bold">Cecha</th>
                        {packages.map(pkg => (
                            <th key={pkg.id} className="p-4 border-b-2 border-gray-200 bg-white text-center w-1/4 align-bottom">
                                <div className="font-bold text-lg text-gray-800 leading-tight mb-2">{pkg.name}</div>
                                <div className="text-[#4E61F6] font-bold text-xl">{pkg.price}</div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="text-sm">
                    <tr className="hover:bg-gray-50">
                        <td className="td-modal">Kategoria</td>
                        {packages.map(pkg => (
                            <td key={pkg.id} className="p-3 border-b border-gray-100 text-center text-gray-600">
                                {pkg.category}
                            </td>
                        ))}
                    </tr>

                    <tr className="hover:bg-gray-50">
                        <td className="td-modal">Stomatologia</td>
                        {packages.map(pkg => (
                            <td key={pkg.id} className="p-3 border-b border-gray-100 text-center">
                                {pkg.hasDentalCare ? <CheckIcon /> : <CrossIcon />}
                            </td>
                        ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="td-modal">Szpital</td>
                        {packages.map(pkg => (
                            <td key={pkg.id} className="p-3 border-b border-gray-100 text-center">
                                {pkg.hasHospitalization ? <CheckIcon /> : <CrossIcon />}
                            </td>
                        ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="td-modal">Rehabilitacja</td>
                        {packages.map(pkg => (
                            <td key={pkg.id} className="p-3 border-b border-gray-100 text-center">
                                {pkg.hasRehabilitation ? <CheckIcon /> : <CrossIcon />}
                            </td>
                        ))}
                    </tr>

                    <tr className="hover:bg-gray-50">
                        <td className="td-modal">Liczba specjalistów</td>
                        {packages.map(pkg => (
                            <td key={pkg.id} className="p-3 border-b border-gray-100 text-center font-bold text-gray-800">
                                {pkg.specialistsCount}
                            </td>
                        ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="td-modal">Liczba placówek</td>
                        {packages.map(pkg => (
                            <td key={pkg.id} className="p-3 border-b border-gray-100 text-center font-bold text-gray-800">
                                {pkg.facilitiesCount}
                            </td>
                        ))}
                    </tr>

                    <tr className="hover:bg-gray-50 bg-yellow-50/30">
                        <td className="td-modal">Ocena użytkowników</td>
                        {packages.map(pkg => (
                            <td key={pkg.id} className="p-3 border-b border-gray-100 text-center">
                                <span className="text-yellow-500 font-bold">★ {pkg.averageRating.toFixed(1)}</span>
                                <span className="text-xs text-gray-400 ml-1">({pkg.reviews})</span>
                            </td>
                        ))}
                    </tr>
                    </tbody>
                </table>

                <div className="mt-8 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Zamknij</Button>
                </div>
            </div>
        </Modal>
    )
}