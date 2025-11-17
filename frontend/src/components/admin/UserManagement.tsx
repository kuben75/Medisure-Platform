import {useEffect, useState} from "react"
import {useAuth} from "../../context/AuthContext.tsx"
import Button from "../ui/Button.tsx"
import type {IUserDto} from "../../types/types.ts"
import EditIcon from "../icons/EditIcon.tsx"
import DeleteIcon from "../icons/DeleteIcon.tsx"
import {UserFormModal} from "./UserFormModal.tsx";


export default function UserManagement() {
    const [users, setUsers] = useState<IUserDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { token } = useAuth()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<IUserDto | null>(null)

    const API_URL_USERS = "https://localhost:44333/api/admin/users"

    const fetchUsers = async () => {
        if (!token) { setError("Brak autoryzacji."); setLoading(false); return; }
        try {
            setLoading(true);
            const response = await fetch(API_URL_USERS, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Błąd pobierania danych użytkowników');
            const data = await response.json();
            setUsers(data);
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { if(token) { fetchUsers(); } }, [token]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;
        if (!token) { setError("Błąd autoryzacji."); return; }
        try {
            const response = await fetch(`${API_URL_USERS}/${id}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                let errorData = { message: 'Nie udało się usunąć użytkownika.' };
                try { errorData = await response.json(); } catch(e) {}
                throw new Error(errorData.message);
            }
            fetchUsers();
        } catch (err: any) { setError(err.message); }
    };

    const handleOpenEditModal = (user: IUserDto) => {
        setUserToEdit(user);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setUserToEdit(null);
    };

    const handleSaveSuccess = () => {
        handleCloseEditModal();
        fetchUsers();
    };

    if (loading) return <div>Ładowanie listy użytkowników...</div>;

    return (
        <>
            <div className="mt-8 bg-slate-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Zarządzanie Użytkownikami</h2>
                    <Button variant="primary" className="!py-2 !px-3 text-[16px]" disabled>
                        + Dodaj nowego użytkownika
                    </Button>
                </div>
                {error && <div className="text-red-500 mb-4">Błąd: {error}</div>}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Imię i Nazwisko</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Email</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Role</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
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