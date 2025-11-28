import {useEffect, useState} from "react"
import Button from "../ui/Button.tsx"
import EditIcon from "../icons/EditIcon.tsx"
import DeleteIcon from "../icons/DeleteIcon.tsx"
import {UserFormModal} from "./UserFormModal.tsx"
import type {IUserDto} from "../../types/user.types.ts";
import {useConfirm} from "../../hooks/UseConfrim.ts";
import {useNotification} from "../../hooks/UseNotification.ts";
import {useAuth} from "../../hooks/useAuth.ts";

export default function UserManagement() {
    const [users, setUsers] = useState<IUserDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterText, setFilterText] = useState('');
    const { token } = useAuth()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<IUserDto | null>(null)
    const confirm  = useConfirm()
    const { notify } = useNotification()
    const API_URL_USERS = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/admin/users`

    const fetchUsers = async () => {
        if (!token) { setError("Brak autoryzacji."); setLoading(false); return; }
        try {
            setLoading(true);
            const response = await fetch(API_URL_USERS, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Błąd pobierania danych użytkowników');
            const data = await response.json();
            setUsers(data);
        } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
        finally { setLoading(false); }
    }

    useEffect(() => { if(token) { fetchUsers(); } }, [token])

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: "Usuwanie użytkownika",
            description: "Czy na pewno chcesz usunąć tego użytkownika?",
            confirmText: "Usuń",
            variant: 'danger'
        })
        if(!isConfirmed) return

        if (!token) {
            notify.error("Błąd autoryzacji.")
            return
        }
        try {
            const response = await fetch(`${API_URL_USERS}/${id}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                let errorData = { message: 'Nie udało się usunąć użytkownika.' }
                try { errorData = await response.json() }
                catch(err)
                {setError(err instanceof Error ? err.message : String(err))}
                throw new Error(errorData.message)
            }
            notify.success("Użytkownik usunięty pomyślnie.")
            fetchUsers()
        } catch (err) { setError(err instanceof Error ? err.message : String(err)) }
    };

    const handleOpenEditModal = (user: IUserDto) => {
        setUserToEdit(user)
        setIsEditModalOpen(true)
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false)
        setUserToEdit(null)
    }

    const handleSaveSuccess = () => {
        handleCloseEditModal()
        fetchUsers()
    }
    const filteredUsers = users.filter(user => {
        const search = filterText.toLowerCase()
        return (
            user.firstName.toLowerCase().includes(search) ||
            user.lastName.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        )
    })
    if (loading) return <div>Ładowanie listy użytkowników...</div>

    return (
        <>
            <div className="mt-8 bg-slate-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Zarządzanie Użytkownikami</h2>
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Szukaj użytkownika..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4E61F6] focus:border-[#4E61F6]"
                        />
                        <div className="absolute right-3 top-2.5 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                 className="w-5 h-5">
                                <path fillRule="evenodd"
                                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                    </div>
                    <Button variant="primary" className="!py-2 !px-3 text-[16px]" disabled>
                        + Dodaj nowego użytkownika
                    </Button>
                </div>
                {error && <div className="text-red-500 mb-4">Błąd: {error}</div>}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Imię i
                                Nazwisko
                            </th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Email</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Role</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{user.email}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {user.roles.map(role => (
                                        <span key={role} className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {role}
                                            </span>
                                    ))}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700 flex gap-2">
                                    <button
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        onClick={() => handleOpenEditModal(user)}
                                    >
                                        <EditIcon className="w-6 h-6 relative top-[1px]"/>
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        <DeleteIcon className="w-6 h-6 relative top-[1px]"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-6 text-center text-gray-500">
                                    Nie znaleziono użytkowników pasujących do wyszukiwania.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserFormModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSaveSuccess={handleSaveSuccess}
                token={token}
                userToEdit={userToEdit}
            />
        </>
    );
}