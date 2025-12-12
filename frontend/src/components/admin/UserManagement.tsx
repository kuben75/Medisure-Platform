import {useEffect, useState} from "react"
import EditIcon from "../icons/EditIcon.tsx"
import DeleteIcon from "../icons/DeleteIcon.tsx"
import LockIcon from "../icons/LockIcon.tsx"
import LockOpenIcon from "../icons/LockOpenIcon.tsx"
import ShieldCheckIcon from "../icons/ShieldCheckIcon.tsx"
import UserIcon from "../icons/UserIcon.tsx"

import {UserFormModal} from "./UserFormModal.tsx"
import type {IUserDto} from "../../types/user.types.ts";
import {useConfirm} from "../../hooks/UseConfrim.ts"
import {useNotification} from "../../hooks/UseNotification.ts"
import {useAuth} from "../../hooks/useAuth.ts"
import Modal from "../ui/Modal.tsx"
import Button from "../ui/Button.tsx"
import CrownIcon from "../icons/CrownIcon.tsx"
import SearchIcon from "../icons/SearchIcon.tsx";

const API_URL_USERS = `${import.meta.env.VITE_API_URL}/admin/users`

export default function UserManagement() {
    const [users, setUsers] = useState<IUserDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const {token, roles: myRoles, user: currentUser} = useAuth()

    const [filterText, setFilterText] = useState('')
    const [filterRole, setFilterRole] = useState<'ALL' | 'Admin' | 'User'>('ALL')
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'Active' | 'Locked'>('ALL')

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<IUserDto | null>(null)

    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
    const [userToBlock, setUserToBlock] = useState<IUserDto | null>(null)
    const [blockReason, setBlockReason] = useState("")

    const confirm = useConfirm()
    const {notify} = useNotification()

    const amISuperAdmin = myRoles?.includes('SuperAdmin')

    const fetchUsers = async () => {
        if (!token) {
            setError("Brak autoryzacji.");
            setLoading(false);
            return
        }
        try {
            setLoading(true);
            const response = await fetch(API_URL_USERS, {headers: {'Authorization': `Bearer ${token}`}})
            if (!response.ok) throw new Error('Błąd pobierania danych użytkowników')
            const data = await response.json()
            setUsers(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Wystąpił błąd");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token])

    const handleChangeRole = async (targetUser: IUserDto) => {
        const isCurrentlyAdmin = targetUser.roles.includes('Admin');
        const newRole = isCurrentlyAdmin ? 'User' : 'Admin';
        const actionText = isCurrentlyAdmin ? 'zdegradować do Użytkownika' : 'awansować na Administratora';

        const isConfirmed = await confirm({
            title: "Zmiana uprawnień",
            description: `Czy na pewno chcesz ${actionText} użytkownika ${targetUser.email}?`,
            confirmText: isCurrentlyAdmin ? "Zdegraduj" : "Awansuj",
            variant: isCurrentlyAdmin ? 'danger' : 'info'
        });

        if (!isConfirmed) return;

        const oldRoles = [...targetUser.roles];
        setUsers(prev => prev.map(u => {
            if (u.id === targetUser.id) {
                const updatedRoles = isCurrentlyAdmin
                    ? u.roles.filter(r => r !== 'Admin').concat('User')
                    : u.roles.filter(r => r !== 'User').concat('Admin');
                return {...u, roles: updatedRoles};
            }
            return u;
        }));

        try {
            const response = await fetch(`${API_URL_USERS}/${targetUser.id}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({newRole})
            });

            if (!response.ok) {
                setUsers(prev => prev.map(u => u.id === targetUser.id ? {...u, roles: oldRoles} : u));
                const err = await response.json();
                throw new Error(err.message || "Błąd zmiany roli.");
            }

            notify.success(`Rola użytkownika zmieniona na ${newRole}.`)
            fetchUsers();
        } catch (err: any) {
            notify.error(err.message);
        }
    }

    const handleOpenBlockModal = (user: IUserDto) => {
        setUserToBlock(user);
        setBlockReason("");
        setIsBlockModalOpen(true);
    }

    const handleBlockUser = async () => {
        if (!userToBlock || !token) return;
        try {
            const response = await fetch(`${API_URL_USERS}/${userToBlock.id}/lock`, {
                method: 'PUT',
                headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'},
                body: JSON.stringify({reason: blockReason || "Naruszenie regulaminu"})
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Błąd blokowania.");
            }
            notify.success(`Użytkownik ${userToBlock.email} został zablokowany.`);
            setIsBlockModalOpen(false);
            setUserToBlock(null);
            fetchUsers();
        } catch (err: any) {
            notify.error(err.message);
        }
    }

    const handleUnlockUser = async (user: IUserDto) => {
        const isConfirmed = await confirm({
            title: "Odblokowanie użytkownika",
            description: `Czy na pewno chcesz odblokować użytkownika ${user.email}?`,
            confirmText: "Odblokuj",
            variant: "info"
        });
        if (!isConfirmed) return;
        try {
            const response = await fetch(`${API_URL_USERS}/${user.id}/unlock`, {
                method: 'PUT',
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!response.ok) throw new Error("Błąd odblokowywania.");
            notify.success("Użytkownik odblokowany.");
            fetchUsers();
        } catch (err: any) {
            notify.error(err.message);
        }
    }

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: "Usuwanie użytkownika",
            description: "Czy na pewno chcesz usunąć tego użytkownika? Ta operacja jest nieodwracalna.",
            confirmText: "Usuń trwale",
            variant: 'danger'
        });
        if (!isConfirmed) return;
        try {
            const response = await fetch(`${API_URL_USERS}/${id}`, {
                method: 'DELETE', headers: {'Authorization': `Bearer ${token}`}
            });
            if (!response.ok) {
                let errorData = {message: 'Nie udało się usunąć użytkownika.'}
                try {
                    errorData = await response.json();
                } catch (e) { /* ignore */
                }
                throw new Error(errorData.message);
            }
            notify.success("Użytkownik usunięty pomyślnie.");
            fetchUsers();
        } catch (err) {
            notify.error(err instanceof Error ? err.message : "Wystąpił błąd")
        }
    }

    const handleOpenEditModal = (user: IUserDto) => {
        setUserToEdit(user)
        setIsEditModalOpen(true)
    }
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setUserToEdit(null);
    }
    const handleSaveSuccess = () => {
        handleCloseEditModal()
        fetchUsers()
        notify.success("Dane zaktualizowane.")
    }

    const filteredUsers = users.filter(user => {
        const search = filterText.toLowerCase();
        const matchesText = (
            (user.firstName?.toLowerCase() || '').includes(search) ||
            (user.lastName?.toLowerCase() || '').includes(search) ||
            (user.email?.toLowerCase() || '').includes(search)
        );

        let matchesRole = true;
        if (filterRole !== 'ALL') {
            if (filterRole === 'Admin') matchesRole = user.roles.includes('Admin');
            if (filterRole === 'User') matchesRole = user.roles.includes('User') && !user.roles.includes('Admin');
        }

        let matchesStatus = true
        if (filterStatus === 'Locked') matchesStatus = !!user.isLocked
        if (filterStatus === 'Active') matchesStatus = !user.isLocked

        return matchesText && matchesRole && matchesStatus
    });


    const getHighestRole = (roles: string[]) => {
        if (roles.includes('SuperAdmin')) return 'SuperAdmin'
        if (roles.includes('Admin')) return 'Admin'
        return 'User'
    }

    const getRoleStyles = (role: string, isLocked: boolean) => {
        if (isLocked) return {badge: 'bg-red-100 text-red-800', avatar: 'bg-red-100 text-red-600'};

        switch (role) {
            case 'SuperAdmin':
                return {
                    badge: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
                    avatar: 'bg-amber-100 text-amber-600'
                };
            case 'Admin':
                return {badge: 'bg-purple-100 text-purple-800', avatar: 'bg-purple-100 text-purple-600'};
            default:
                return {badge: 'bg-blue-100 text-blue-800', avatar: 'bg-blue-100 text-blue-600'};
        }
    }

    if (loading) return <div className="text-center py-10 text-gray-500">Ładowanie listy użytkowników...</div>;

    return (
        <>
            <div className="mt-4 md:mt-8 bg-white md:bg-slate-50 p-4 md:p-6 rounded-xl md:border border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Zarządzanie Użytkownikami</h2>
                    <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative w-full md:w-64">
                            <input type="text" value={filterText} onChange={(e) => setFilterText(e.target.value)}
                                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none text-sm"
                                   placeholder="Szukaj..."/>
                            <div className="absolute left-3 top-3 text-gray-400"><SearchIcon className="w-5 h-5"/></div>
                        </div>
                        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)}
                                className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#4E61F6] outline-none">
                            <option value="ALL">Wszystkie role</option>
                            <option value="User">Użytkownicy</option>
                            <option value="Admin">Administratorzy</option>
                        </select>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#4E61F6] outline-none">
                            <option value="ALL">Statusy</option>
                            <option value="Active">Aktywni</option>
                            <option value="Locked">Zablokowani</option>
                        </select>
                    </div>
                </div>

                {error && <div
                    className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4 text-sm">{error}</div>}

                <div className="hidden md:block overflow-x-auto rounded-xl shadow-sm border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase">Użytkownik</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase">Kontakt</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase">Rola</th>
                            <th className="py-4 px-6 text-right text-xs font-bold text-gray-500 uppercase">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => {
                            const isTargetAdmin = user.roles.includes('Admin');
                            const isTargetSuper = user.roles.includes('SuperAdmin');
                            const isMe = currentUser?.email === user.email;

                            const canManage = !isMe && (amISuperAdmin ? !isTargetSuper : (!isTargetAdmin && !isTargetSuper));
                            const canEdit = !isMe && (amISuperAdmin || !isTargetAdmin);

                            const displayRole = getHighestRole(user.roles);
                            const styles = getRoleStyles(displayRole, user.isLocked);

                            return (
                                <tr key={user.id}
                                    className={`transition-colors group ${user.isLocked ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            <div
                                                className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${styles.avatar}`}>
                                                {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div
                                                    className={`text-sm font-bold ${user.isLocked ? 'text-red-800' : 'text-gray-900'}`}>
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div
                                                    className="text-xs text-gray-400 font-mono">ID: {user.id.substring(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {user.isLocked ?
                                            <span
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Zablokowany</span> :
                                            <span
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Aktywny</span>
                                        }
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm text-gray-900 font-medium">{user.email}</div>
                                        <div className="text-xs text-gray-500">{user.phoneNumber || '-'}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${styles.badge}`}>
                                            {displayRole}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 items-center">
                                            {isMe ? (
                                                <span
                                                    className="text-xs font-bold text-[#4E61F6] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">To Ty</span>
                                            ) : (
                                                <>
                                                    {amISuperAdmin && !isTargetSuper ? (
                                                        <button onClick={() => handleChangeRole(user)}
                                                                className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${isTargetAdmin ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' : 'text-amber-600 bg-amber-50 hover:bg-amber-100'}`}
                                                                title="Zmień rolę">
                                                            {isTargetAdmin ? <UserIcon className="w-5 h-5"/> :
                                                                <CrownIcon className="w-5 h-5"/>}
                                                        </button>
                                                    ) : (
                                                        <div
                                                            className="p-2 text-gray-400 cursor-not-allowed opacity-0 group-hover:opacity-50"
                                                            title="Brak uprawnień"><CrownIcon className="w-5 h-5"/>
                                                        </div>
                                                    )}

                                                    {user.isLocked ? (
                                                        <button onClick={() => handleUnlockUser(user)}
                                                                className="text-green-600 bg-green-50 p-2 rounded-lg hover:bg-green-100 opacity-0 group-hover:opacity-100">
                                                            <LockOpenIcon className="w-5 h-5"/>
                                                        </button>
                                                    ) : (
                                                        canManage ? (
                                                            <button onClick={() => handleOpenBlockModal(user)}
                                                                    className="text-orange-600 bg-orange-50 p-2 rounded-lg hover:bg-orange-100 opacity-0 group-hover:opacity-100">
                                                                <LockIcon className="w-5 h-5"/>
                                                            </button>
                                                        ) : (
                                                            <div
                                                                className="p-2 text-gray-400 cursor-not-allowed opacity-0 group-hover:opacity-50">
                                                                <ShieldCheckIcon className="w-5 h-5"/></div>
                                                        )
                                                    )}

                                                    {canEdit ? (
                                                        <button onClick={() => handleOpenEditModal(user)}
                                                                className="text-indigo-600 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 opacity-0 group-hover:opacity-100">
                                                            <EditIcon className="w-5 h-5"/>
                                                        </button>
                                                    ) : (
                                                        <div
                                                            className="p-2 text-gray-400 cursor-not-allowed opacity-0 group-hover:opacity-50">
                                                            <EditIcon className="w-5 h-5"/></div>
                                                    )}

                                                    {canManage ? (
                                                        <button onClick={() => handleDelete(user.id)}
                                                                className="text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100 opacity-0 group-hover:opacity-100">
                                                            <DeleteIcon className="w-5 h-5"/>
                                                        </button>
                                                    ) : (
                                                        <div
                                                            className="p-2 text-gray-400 cursor-not-allowed opacity-0 group-hover:opacity-50">
                                                            <DeleteIcon className="w-5 h-5"/></div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden space-y-4">
                    {filteredUsers.map((user) => {
                        const isTargetAdmin = user.roles.includes('Admin');
                        const isTargetSuper = user.roles.includes('SuperAdmin');
                        const isMe = currentUser?.email === user.email;
                        const canManage = !isMe && (amISuperAdmin ? !isTargetSuper : (!isTargetAdmin && !isTargetSuper));
                        const canEdit = !isMe && (amISuperAdmin || !isTargetAdmin);
                        const displayRole = getHighestRole(user.roles);
                        const styles = getRoleStyles(displayRole, user.isLocked);

                        return (
                            <div key={user.id}
                                 className={`bg-white p-4 rounded-xl border shadow-sm relative overflow-hidden ${user.isLocked ? 'border-red-200' : 'border-gray-200'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${styles.avatar}`}>
                                            {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div
                                                className="font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                                            <div className="text-xs text-gray-500 break-all">{user.email}</div>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles.badge}`}>
                                        {displayRole}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <div>
                                        {user.isLocked ? (
                                            <span
                                                className="text-xs font-bold text-red-600 flex items-center gap-1"><LockIcon
                                                className="w-3 h-3"/> Zablokowany</span>
                                        ) : (
                                            <span
                                                className="text-xs font-bold text-green-600 flex items-center gap-1"><ShieldCheckIcon
                                                className="w-3 h-3"/> Aktywny</span>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        {isMe ? <span
                                            className="text-xs font-bold text-[#4E61F6] bg-blue-50 px-2 py-1 rounded">To Ty</span> : (
                                            <>
                                                {canEdit && <button onClick={() => handleOpenEditModal(user)}
                                                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <EditIcon className="w-5 h-5"/></button>}
                                                {canManage && <button onClick={() => handleDelete(user.id)}
                                                                      className="p-2 bg-red-50 text-red-600 rounded-lg">
                                                    <DeleteIcon className="w-5 h-5"/></button>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filteredUsers.length === 0 && <div
                    className="py-12 text-center text-gray-400 bg-white md:bg-transparent rounded-xl border border-dashed border-gray-300 md:border-none">Brak
                    wyników</div>}
            </div>

            <UserFormModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSaveSuccess={handleSaveSuccess}
                           token={token} userToEdit={userToEdit}/>
            <Modal isOpen={isBlockModalOpen} onClose={() => setIsBlockModalOpen(false)}>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Blokowanie użytkownika</h2>
                <p className="text-sm text-gray-600 mb-4">Blokujesz <strong>{userToBlock?.email}</strong>. Podaj powód.
                </p>
                <textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)}
                          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none mb-4 bg-slate-50"
                          rows={3}/>
                <div className="flex justify-end gap-3"><Button variant="secondary"
                                                                onClick={() => setIsBlockModalOpen(false)}>Anuluj</Button><Button
                    variant="primary" className="!bg-red-600 hover:!bg-red-700"
                    onClick={handleBlockUser}>Zablokuj</Button></div>
            </Modal>
        </>
    )
}