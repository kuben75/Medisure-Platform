import {useState, type SetStateAction} from "react";
import SearchIcon from "../icons/SearchIcon.tsx";
import Button from "../ui/Button.tsx";
import Modal from "../ui/modals/Modal.tsx";
import {UserFormModal} from "../ui/modals/UserFormModal.tsx";
import UserTable from "../users/UserTable.tsx";
import {useUsers} from "../../hooks/useUsers.ts";
import type {IUserDto} from "../../types/user.types.ts";

export default function UserManagement() {
    const {
        users, loading, error, token, currentUser, amISuperAdmin, fetchUsers,
        modals, actions
    } = useUsers();

    const [filterText, setFilterText] = useState('');
    const [filterRole, setFilterRole] = useState<'ALL' | 'Admin' | 'User'>('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'Active' | 'Locked'>('ALL');
    const [blockReason, setBlockReason] = useState("");

    const filteredUsers = users.filter(user => {
        const search = filterText.toLowerCase();
        const matchesText = (
            (user.firstName?.toLowerCase() || '').includes(search) ||
            (user.lastName?.toLowerCase() || '').includes(search) ||
            (user.email?.toLowerCase() || '').includes(search)
        );

        let matchesRole = true;
        if (filterRole === 'Admin') {
            matchesRole = user.roles.includes('Admin');
        }
        if (filterRole === 'User') {
            matchesRole = user.roles.includes('User') && !user.roles.includes('Admin');
        }

        let matchesStatus = true;
        if (filterStatus === 'Locked') {
            matchesStatus = !!user.isLocked;
        }
        if (filterStatus === 'Active') {
            matchesStatus = !user.isLocked;
        }

        return matchesText && matchesRole && matchesStatus;
    });

    const handleSaveSuccess = () => {
        modals.setIsEditModalOpen(false);
        modals.setUserToEdit(null);

        fetchUsers().then(() => console.log("Użytkownik zapisany, lista odświeżona"));
    };

    if (loading) {
        return <div className="text-center py-10 text-gray-500">Ładowanie listy...</div>;
    }

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

                <UserTable
                    users={filteredUsers}
                    currentUser={currentUser}
                    amISuperAdmin={amISuperAdmin}
                    onEdit={(u: SetStateAction<IUserDto | null>) => {
                        modals.setUserToEdit(u);
                        modals.setIsEditModalOpen(true);
                    }}
                    onDelete={actions.deleteUser}
                    onChangeRole={actions.changeRole}
                    onBlock={(u: SetStateAction<IUserDto | null>) => {
                        modals.setUserToBlock(u);
                        setBlockReason("");
                        modals.setIsBlockModalOpen(true);
                    }}
                    onUnlock={actions.unlockUser}
                />

                <div className="md:hidden text-center text-gray-500 py-4">Widok mobilny jest uproszczony (zobacz na
                    tablecie/desktopie).
                </div>

                {filteredUsers.length === 0 && <div className="py-12 text-center text-gray-400">Brak wyników</div>}
            </div>

            <UserFormModal
                isOpen={modals.isEditModalOpen}
                onClose={() => modals.setIsEditModalOpen(false)}
                onSaveSuccess={handleSaveSuccess}
                token={token}
                userToEdit={modals.userToEdit}
            />

            <Modal isOpen={modals.isBlockModalOpen} onClose={() => modals.setIsBlockModalOpen(false)}>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Blokowanie użytkownika</h2>
                <p className="text-sm text-gray-600 mb-4">Blokujesz <strong>{modals.userToBlock?.email}</strong>. Podaj
                    powód.</p>
                <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none mb-4 bg-slate-50"
                    rows={3}
                />
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => modals.setIsBlockModalOpen(false)}>Anuluj</Button>
                    <Button variant="primary" className="!bg-red-600 hover:!bg-red-700"
                            onClick={() => actions.blockUser(blockReason)}>Zablokuj</Button>
                </div>
            </Modal>
        </>
    )
}