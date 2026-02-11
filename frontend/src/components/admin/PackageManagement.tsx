import {useState} from "react";
import Button from "../ui/Button.tsx";
import SearchIcon from "../icons/SearchIcon.tsx";
import EditIcon from "../icons/EditIcon.tsx";
import DeleteIcon from "../icons/DeleteIcon.tsx";
import {PackageFormModal} from "../ui/modals/PackageFormModal.tsx";
import PackageTable from "./packages/PackageTable.tsx";
import {useAdminPackages} from "../../hooks/useAdminPackages.ts";
import {getCategoryBadgeStyle} from "../../utils/pricingHelpers.ts";
import SearchPackageIcon from "../icons/SearchPackageIcon.tsx";

export default function PackageManagement() {
    const {packages, loading, error, token, modals, actions} = useAdminPackages();
    const [filterText, setFilterText] = useState('');

    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(filterText.toLowerCase()) ||
        pkg.category.toLowerCase().includes(filterText.toLowerCase())
    );

    if (loading) {
        return <div className="text-center py-10 text-gray-500">Ładowanie listy pakietów...</div>;
    }
    if (error) {
        return <div className="text-red-500 text-center py-10">Błąd: {error}</div>;
    }

    return (
        <>
            <div className="mt-4 md:mt-8 bg-white md:bg-slate-50 p-4 md:p-6 rounded-xl md:border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Zarządzanie Pakietami</h2>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Szukaj pakietu..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none transition-all bg-white shadow-sm text-sm"
                            />
                            <div className="absolute left-3 top-3 text-gray-400"><SearchIcon className="w-5 h-5"/></div>
                        </div>
                        <Button variant="primary"
                                className="!py-2.5 !px-4 text-sm shadow-md whitespace-nowrap justify-center"
                                onClick={actions.handleOpenAdd}>
                            + Nowy pakiet
                        </Button>
                    </div>
                </div>

                <PackageTable
                    packages={filteredPackages}
                    onEdit={actions.handleOpenEdit}
                    onDelete={actions.deletePackage}
                />

                <div className="md:hidden space-y-4">
                    {filteredPackages.map((pkg) => (
                        <div key={pkg.id}
                             className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <div
                                className={`absolute left-0 top-0 bottom-0 w-1.5 ${pkg.isFeatured ? 'bg-yellow-400' : 'bg-[#4E61F6]'}`}></div>
                            <div className="flex justify-between items-start mb-3 pl-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{pkg.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getCategoryBadgeStyle(pkg.category)}`}>
                                            {pkg.category}
                                        </span>
                                        {pkg.isFeatured && <span
                                            className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">★ HERO</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-[#4E61F6]">{pkg.price}</div>
                                    <div className="text-[10px] text-gray-400">/ mc</div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pl-3 pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-400 font-mono">ID: {pkg.id}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => actions.handleOpenEdit(pkg)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 active:scale-95">
                                        <EditIcon className="w-4 h-4"/> Edytuj
                                    </button>
                                    <button onClick={() => actions.deletePackage(pkg.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 active:scale-95">
                                        <DeleteIcon className="w-4 h-4"/> Usuń
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredPackages.length === 0 && (
                    <div
                        className="py-12 text-center text-gray-400 bg-white md:bg-transparent rounded-xl border border-dashed border-gray-300 md:border-none">
                        <div className="text-4xl mb-2"><SearchPackageIcon/></div>
                        <p>Nie znaleziono pakietów.</p>
                    </div>
                )}
            </div>

            <PackageFormModal
                isOpen={modals.isModalOpen}
                onClose={() => modals.setIsModalOpen(false)}
                onPackageAdded={actions.handleSaveSuccess}
                token={token}
                packageToEdit={modals.editingPackage}
            />
        </>
    )
}