import {useEffect, useState} from "react"
import Button from "../ui/Button.tsx";
import EditIcon from "../icons/EditIcon.tsx";
import DeleteIcon from "../icons/DeleteIcon.tsx";
import {PackageFormModal} from "./PackageFormModal.tsx";
import type {IPricingPlan} from "../../types/pricing.types.ts";
import {useConfirm} from "../../hooks/UseConfrim.ts";
import {useNotification} from "../../hooks/UseNotification.ts";
import {useAuth} from "../../hooks/useAuth.ts";

const API_URL = `${import.meta.env.VITE_API_URL}/packages`

export default function PackageManagement() {
    const [packages, setPackages] = useState<IPricingPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
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
    }

    const handleDelete = async (id: number) => {
        const isConfirmed = await confirm({
            title: "Usuwanie pakietu",
            description: "Czy na pewno chcesz usunąć ten pakiet?",
            confirmText: "Usuń",
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

            await fetchPackages()
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        }
    }

    if (loading) return <div>Ładowanie listy pakietów...</div>
    if (error) return <div className="text-red-500">Błąd: {error}</div>

    return (
        <>
            <div className="mt-8 bg-slate-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Zarządzanie Pakietami</h2>
                    <Button variant="primary" className="!py-2 !px-3 !text-[16px]" onClick={handleOpenAddModal}>
                        + Dodaj nowy pakiet
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">ID</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Nazwa</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Cena</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Wyróżniony?</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {packages.map((pkg) => (
                            <tr key={pkg.id}>
                                <td className="py-3 px-4 text-sm text-gray-700">{pkg.id}</td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">{pkg.name}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{pkg.price}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {pkg.isFeatured ? (
                                        <span
                                            className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Tak</span>
                                    ) : (
                                        <span
                                            className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Nie</span>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    <div className="flex items-center justify-center gap-5">
                                        <button
                                            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center"
                                            onClick={() => handleOpenEditModal(pkg)}
                                        >
                                            <EditIcon className="w-6 h-6 relative top-[1px]"/>
                                        </button>
                                        <button className="text-red-600 hover:text-red-800 transition-colors flex items-center justify-center"
                                                onClick={() => handleDelete(pkg.id)}>
                                            <DeleteIcon className="w-6 h-6 relative top-[1px]"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
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