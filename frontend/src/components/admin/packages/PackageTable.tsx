import EditIcon from "../../icons/EditIcon.tsx";
import DeleteIcon from "../../icons/DeleteIcon.tsx";
import type {IPackageTableProps} from "../../../types/ui.types.ts";
import PackageIcon from "../../icons/PackageIcon.tsx";
import {getCategoryBadgeStyle} from "../../../utils/pricingHelpers.ts";

export default function PackageTable({packages, onEdit, onDelete}: IPackageTableProps) {

    return (
        <div className="hidden md:block overflow-x-auto rounded-xl shadow-sm border border-gray-200">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pakiet</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kategoria</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cena</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-4 px-6">
                            <div className="flex items-center">
                                <div
                                    className={`h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center shadow-sm ${pkg.isFeatured ? 'bg-yellow-400' : 'bg-[#4E61F6]'}`}>
                                    <PackageIcon/>
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-bold text-gray-900">{pkg.name}</div>
                                    <div className="text-xs text-gray-400">ID: {pkg.id}</div>
                                </div>
                            </div>
                        </td>
                        <td className="py-4 px-6">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryBadgeStyle(pkg.category)}`}>
                                {pkg.category}
                            </span>
                        </td>
                        <td className="py-4 px-6">
                            <div className="text-sm font-bold text-gray-900">{pkg.price}</div>
                            <div className="text-xs text-gray-400">miesięcznie</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                            {pkg.isFeatured ? (
                                <span
                                    className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-100">★ Wyróżniony</span>
                            ) : (
                                <span className="text-xs text-gray-500 font-semibold">Standard</span>
                            )}
                        </td>
                        <td className="py-4 px-6 text-right text-sm font-medium">
                            <div
                                className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(pkg)}
                                        className="text-indigo-600 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100"
                                        title="Edytuj">
                                    <EditIcon className="w-5 h-5"/>
                                </button>
                                <button onClick={() => onDelete(pkg.id)}
                                        className="text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100" title="Usuń">
                                    <DeleteIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}