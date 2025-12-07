import {useEffect, useState} from "react"
import EditIcon from "../icons/EditIcon.tsx"
import DeleteIcon from "../icons/DeleteIcon.tsx"
import {UserFormModal} from "./UserFormModal.tsx"
import type {IUserDto} from "../../types/user.types.ts";
import {useConfirm} from "../../hooks/UseConfrim.ts";
import {useNotification} from "../../hooks/UseNotification.ts";
import {useAuth} from "../../hooks/useAuth.ts";

const API_URL_USERS = `${import.meta.env.VITE_API_URL}/admin/users`;

export default function UserManagement() {
    const [users, setUsers] = useState<IUserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterText, setFilterText] = useState('');
    const { token } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<IUserDto | null>(null);

    const confirm = useConfirm();
    const { notify } = useNotification();

    const fetchUsers = async () => {
        if (!token) { setError("Brak autoryzacji."); setLoading(false); return; }
        try {
            setLoading(true);
            const response = await fetch(API_URL_USERS, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Błąd pobierania danych użytkowników');
            const data = await response.json();
            setUsers(data);
        } catch (err) { setError(err instanceof Error ? err.message : "Wystąpił błąd"); }
        finally { setLoading(false); }
    }

    useEffect(() => { if(token) { fetchUsers(); } }, [token])

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: "Usuwanie użytkownika",
            description: "Czy na pewno chcesz usunąć tego użytkownika? Ta operacja jest nieodwracalna.",
            confirmText: "Usuń trwale",
            variant: 'danger'
        });

        if(!isConfirmed) return;

        try {
            const response = await fetch(`${API_URL_USERS}/${id}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                let errorData = { message: 'Nie udało się usunąć użytkownika.' };
                try { errorData = await response.json(); } catch(e) {
                    throw new Error(e instanceof Error ? e.message : 'Wystąpił błąd');
                }
                throw new Error(errorData.message);
            }

            notify.success("Użytkownik usunięty pomyślnie.");
            fetchUsers();
        } catch (err) {
            notify.error(err instanceof Error ? err.message : "Wystąpił błąd");
        }
    };

    const handleOpenEditModal = (user: IUserDto) => {
        setUserToEdit(user);
        setIsEditModalOpen(true);
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setUserToEdit(null);
    }

    const handleSaveSuccess = () => {
        handleCloseEditModal();
        fetchUsers();
        notify.success("Dane użytkownika zaktualizowane.");
    }

    const filteredUsers = users.filter(user => {
        const search = filterText.toLowerCase();
        return (
            (user.firstName?.toLowerCase() || '').includes(search) ||
            (user.lastName?.toLowerCase() || '').includes(search) ||
            (user.email?.toLowerCase() || '').includes(search)
        );
    });

    if (loading) return <div className="text-center py-10 text-gray-500">Ładowanie listy użytkowników...</div>;

    return (
        <>
            <div className="mt-8 bg-slate-50 p-6 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Zarządzanie Użytkownikami</h2>

                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none transition-all bg-white shadow-sm"
                        />
                        <div className="absolute left-3 top-3 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4 text-sm">{error}</div>}

                <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Użytkownik</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email / Telefon</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="py-4 px-6 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="py-4 px-6">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#E4E7FE] text-[#4E61F6] flex items-center justify-center font-bold text-sm">
                                            {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                                            <div className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                    <div className="text-xs text-gray-500">{user.phoneNumber || 'Brak telefonu'}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.map(role => (
                                            <span key={role} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right text-sm font-medium">
                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors"
                                            onClick={() => handleOpenEditModal(user)}
                                            title="Edytuj"
                                        >
                                            <EditIcon className="w-5 h-5"/>
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"
                                            onClick={() => handleDelete(user.id)}
                                            title="Usuń"
                                        >
                                            <DeleteIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-gray-400">
                                    <div className="text-4xl mb-2">🔍</div>
                                    <p>Nie znaleziono użytkowników pasujących do wyszukiwania.</p>
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