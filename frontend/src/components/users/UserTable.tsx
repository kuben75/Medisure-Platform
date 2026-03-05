import EditIcon from "../icons/EditIcon.tsx";
import DeleteIcon from "../icons/DeleteIcon.tsx";
import LockIcon from "../icons/LockIcon.tsx";
import LockOpenIcon from "../icons/LockOpenIcon.tsx";
import ShieldCheckIcon from "../icons/ShieldCheckIcon.tsx";
import UserIcon from "../icons/UserIcon.tsx";
import CrownIcon from "../icons/CrownIcon.tsx";
import type {IUserTableProps} from "../../types/user.types.ts";

export default function UserTable({
                                      users,
                                      currentUser,
                                      amISuperAdmin,
                                      onEdit,
                                      onDelete,
                                      onChangeRole,
                                      onBlock,
                                      onUnlock
                                  }: IUserTableProps) {
    const getHighestRole = (roles: string[]) => roles.includes('SuperAdmin') ? 'SuperAdmin' : roles.includes('Admin') ? 'Admin' : 'Użytkownik';

    const getStyles = (role: string, isLocked: boolean) => {
        if (isLocked) {
            return {badge: 'bg-red-100 text-red-800', avatar: 'bg-red-100 text-red-600'};
        }
        if (role === 'SuperAdmin') {
            return {
                badge: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
                avatar: 'bg-amber-100 text-amber-600'
            };
        }
        if (role === 'Admin') {
            return {badge: 'bg-purple-100 text-purple-800', avatar: 'bg-purple-100 text-purple-600'};
        }
        return {badge: 'bg-blue-100 text-blue-800', avatar: 'bg-blue-100 text-blue-600'};
    };

    return (
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
                {users.map((user) => {
                    const isTargetAdmin = user.roles.includes('Admin');
                    const isTargetSuper = user.roles.includes('SuperAdmin');
                    const isMe = currentUser?.email === user.email;
                    const canManage = !isMe && (amISuperAdmin ? !isTargetSuper : (!isTargetAdmin && !isTargetSuper));
                    const canEdit = !isMe && (amISuperAdmin || !isTargetAdmin);
                    const role = getHighestRole(user.roles);
                    const styles = getStyles(role, user.isLocked);

                    return (
                        <tr key={user.id}
                            className={`transition-colors group ${user.isLocked ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}>
                            <td className="py-4 px-6">
                                <div className="flex items-center">
                                    <div
                                        className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${styles.avatar}`}>
                                        {user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <div
                                            className={`text-sm font-bold ${user.isLocked ? 'text-red-800' : 'text-gray-900'}`}>{user.firstName} {user.lastName}</div>
                                        <div
                                            className="text-xs text-gray-400 font-mono">ID: {user.id.substring(0, 8)}...
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isLocked ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                        {user.isLocked ? 'Zablokowany' : 'Aktywny'}
                                    </span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="text-sm text-gray-900 font-medium">{user.email}</div>
                                <div className="text-xs text-gray-500">{user.phoneNumber || '-'}</div>
                            </td>
                            <td className="py-4 px-6">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${styles.badge}`}>{role}</span>
                            </td>
                            <td className="py-4 px-6 text-right text-sm font-medium">
                                <div className="flex justify-end gap-2 items-center">
                                    {isMe ? <span
                                        className="text-xs font-bold text-[#4E61F6] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">To Ty</span> : (
                                        <>
                                            {amISuperAdmin && !isTargetSuper && (
                                                <button onClick={() => onChangeRole(user)}
                                                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 ${isTargetAdmin ? 'text-purple-600 bg-purple-50' : 'text-amber-600 bg-amber-50'}`}>
                                                    {isTargetAdmin ? <UserIcon className="w-5 h-5"/> :
                                                        <CrownIcon className="w-5 h-5"/>}
                                                </button>
                                            )}
                                            {user.isLocked ? (
                                                <button onClick={() => onUnlock(user)}
                                                        className="text-green-600 bg-green-50 p-2 rounded-lg opacity-0 group-hover:opacity-100">
                                                    <LockOpenIcon className="w-5 h-5"/></button>
                                            ) : canManage ? (
                                                <button onClick={() => onBlock(user)}
                                                        className="text-orange-600 bg-orange-50 p-2 rounded-lg opacity-0 group-hover:opacity-100">
                                                    <LockIcon className="w-5 h-5"/></button>
                                            ) : <div className="p-2 text-gray-400 opacity-0 group-hover:opacity-50">
                                                <ShieldCheckIcon className="w-5 h-5"/></div>}

                                            {canEdit ? (
                                                <button onClick={() => onEdit(user)}
                                                        className="text-indigo-600 bg-indigo-50 p-2 rounded-lg opacity-0 group-hover:opacity-100">
                                                    <EditIcon className="w-5 h-5"/></button>
                                            ) : <div className="p-2 text-gray-400 opacity-0 group-hover:opacity-50">
                                                <EditIcon className="w-5 h-5"/></div>}

                                            {canManage ? (
                                                <button onClick={() => onDelete(user.id)}
                                                        className="text-red-600 bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100">
                                                    <DeleteIcon className="w-5 h-5"/></button>
                                            ) : <div className="p-2 text-gray-400 opacity-0 group-hover:opacity-50">
                                                <DeleteIcon className="w-5 h-5"/></div>}
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
    );
}