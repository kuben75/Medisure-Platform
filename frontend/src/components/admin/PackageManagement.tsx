import {useEffect, useState} from "react"
import Button from "../ui/Button.tsx";
import EditIcon from "../icons/EditIcon.tsx";
import DeleteIcon from "../icons/DeleteIcon.tsx";
import {PackageFormModal} from "./PackageFormModal.tsx";
import type {IPricingPlan} from "../../types/pricing.types.ts";
import {useAuth} from "../../hooks/useAuth.ts";
import SearchIcon from "../icons/SearchIcon.tsx";
import {useConfirm} from "../../hooks/UseConfrim.ts";
import {useNotification} from "../../hooks/UseNotification.ts";

const API_URL = `${import.meta.env.VITE_API_URL}/packages`
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>

export default function PackageManagement() {
    const [packages, setPackages] = useState<IPricingPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterText, setFilterText] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPackage, setEditingPackage] = useState<IPricingPlan | null>(null)

    const confirm = useConfirm()
    const { token } = useAuth()
    const {notify} = useNotification()

    const fetchPackages = async () => {
        try {
            setLoading(true)
            const response = await fetch(API_URL)
            if (!response.ok) throw new Error('Błąd pobierania danych')

            const data = await response.json()
            setPackages(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPackages()
    }, [])

    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(filterText.toLowerCase()) ||
        pkg.category.toLowerCase().includes(filterText.toLowerCase())
    );

    const handleOpenAddModal = () => {
        setEditingPackage(null)
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (pkg: IPricingPlan) => {
        setEditingPackage(pkg)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingPackage(null)
    }

    const handleSaveSuccess = () => {
        handleCloseModal()
        fetchPackages()
        notify.success(editingPackage ? "Pakiet zaktualizowany." : "Dodano nowy pakiet.")
    }

    const handleDelete = async (id: number) => {
        const isConfirmed = await confirm({
            title: "Usuwanie pakietu",
            description: "Czy na pewno chcesz usunąć ten pakiet? Operacja jest nieodwracalna.",
            confirmText: "Usuń trwale",
            variant: 'danger'
        })
        if(!isConfirmed) return

        if (!token) {
            notify.error("Błąd: Brak autoryzacji. Zaloguj się ponownie.")
            return
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) throw new Error('Nie udało się usunąć pakietu.')

            notify.success("Pakiet został usunięty.")
            await fetchPackages()
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        }
    }

    const getCategoryBadge = (cat: string) => {
        switch(cat) {
            case 'Individual': return 'bg-blue-100 text-blue-700';
            case 'Family': return 'bg-purple-100 text-purple-700';
            case 'Senior': return 'bg-green-100 text-green-700';
            case 'Business': return 'bg-gray-100 text-gray-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    }

    if (loading) return <div className="text-center py-10 text-gray-500">Ładowanie listy pakietów...</div>
    if (error) return <div className="text-red-500 text-center py-10">Błąd: {error}</div>

    return (
        <>
            <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-gray-200">

                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Zarządzanie Pakietami</h2>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Szukaj pakietu..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none transition-all bg-white shadow-sm"
                            />
                            <div className="absolute left-3 top-3">
                                <SearchIcon className="w-6 h-6"/>
                            </div>
                        </div>
                        <Button variant="primary" className="!py-2 !px-4 text-sm shadow-md whitespace-nowrap" onClick={handleOpenAddModal}>
                            + Nowy pakiet
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
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
                        {filteredPackages.map((pkg) => (
                            <tr key={pkg.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="py-4 px-6">
                                    <div className="flex items-center">
                                        <div className={`h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center shadow-sm ${pkg.isFeatured ? 'bg-yellow-400' : 'bg-[#4E61F6]'}`}>
                                            <PackageIcon />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900">{pkg.name}</div>
                                            <div className="text-xs text-gray-400">ID: {pkg.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryBadge(pkg.category)}`}>
                                        {pkg.category}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="text-sm font-bold text-gray-900">{pkg.price}</div>
                                    <div className="text-xs text-gray-400">miesięcznie</div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-700">
                                    {pkg.isFeatured ? (
                                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                                            ★ Wyróżniony
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-500 font-semibold">Standard</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors"
                                            onClick={() => handleOpenEditModal(pkg)}
                                            title="Edytuj"
                                        >
                                            <EditIcon className="w-5 h-5"/>
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"
                                            onClick={() => handleDelete(pkg.id)}
                                            title="Usuń"
                                        >
                                            <DeleteIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredPackages.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-400">
                                    <div className="text-4xl mb-2">📦</div>
                                    <p>Nie znaleziono pakietów.</p>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PackageFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onPackageAdded={handleSaveSuccess}
                token={token}
                packageToEdit={editingPackage}
            />
        </>
    )
}