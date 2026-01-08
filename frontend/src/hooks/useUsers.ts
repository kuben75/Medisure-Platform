import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./useAuth.ts"
import { useNotification } from "./UseNotification.ts"
import { useConfirm } from "./UseConfrim.ts"
import type { IUserDto } from "../types/user.types.ts"

const API_URL_USERS = `${import.meta.env.VITE_API_URL}/admin/users`

export const useUsers = () => {
    const { token, roles: myRoles, user: currentUser } = useAuth()
    const { notify } = useNotification()
    const confirm = useConfirm()

    const [users, setUsers] = useState<IUserDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<IUserDto | null>(null)
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
    const [userToBlock, setUserToBlock] = useState<IUserDto | null>(null)

    const amISuperAdmin = myRoles?.includes('SuperAdmin')

    const fetchUsers = useCallback(async () => {
        if (!token) return
        try {
            setLoading(true)
            const response = await fetch(API_URL_USERS, { headers: { 'Authorization': `Bearer ${token}` } })
            if (!response.ok) throw new Error('Błąd pobierania danych')
            setUsers(await response.json())
        } catch (err) {
            setError(err instanceof Error ? err.message : "Wystąpił błąd")
        } finally {
            setLoading(false)
        }
    }, [token]);

    useEffect(() => {
        fetchUsers().then(() => console.log("Użytkownicy załadowani"))
    }, [fetchUsers])

    const changeRole = async (targetUser: IUserDto) => {
        const isCurrentlyAdmin = targetUser.roles.includes('Admin')
        const newRole = isCurrentlyAdmin ? 'User' : 'Admin'

        if (!await confirm({
            title: "Zmiana uprawnień",
            description: `Czy na pewno chcesz zmienić rolę użytkownika ${targetUser.email}?`,
            confirmText: isCurrentlyAdmin ? "Zdegraduj" : "Awansuj",
            variant: isCurrentlyAdmin ? 'danger' : 'info'
        })) return

        try {
            const response = await fetch(`${API_URL_USERS}/${targetUser.id}/role`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ newRole })
            })

            if (!response.ok) throw new Error("Błąd zmiany roli.")
            notify.success(`Rola zmieniona na ${newRole}.`)
            await fetchUsers()
        } catch (err: any) {
            notify.error(err.message)
        }
    }

    const deleteUser = async (id: string) => {
        if (!await confirm({
            title: "Usuwanie użytkownika",
            description: "Ta operacja jest nieodwracalna.",
            confirmText: "Usuń trwale",
            variant: 'danger'
        })) return

        try {
            const res = await fetch(`${API_URL_USERS}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error("Błąd usuwania.")
            notify.success("Użytkownik usunięty.")
            await fetchUsers()
        } catch (err: any) {
            notify.error(err.message)
        }
    }

    const blockUser = async (reason: string) => {
        if (!userToBlock || !token) return
        try {
            const res = await fetch(`${API_URL_USERS}/${userToBlock.id}/lock`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (!res.ok) throw new Error("Błąd blokowania.")
            notify.success("Użytkownik zablokowany.")
            setIsBlockModalOpen(false)
            await fetchUsers()
        } catch (err: any) {
            notify.error(err.message)
        }
    }

    const unlockUser = async (user: IUserDto) => {
        if (!await confirm({ title: "Odblokowanie", description: "Odblokować użytkownika?", confirmText: "Tak" })) return;
        try {
            await fetch(`${API_URL_USERS}/${user.id}/unlock`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            notify.success("Odblokowano.")
            await fetchUsers()
        } catch (err: any) { notify.error(err.message) }
    }

    return {
        users, loading, error, token, currentUser, amISuperAdmin, fetchUsers,
        modals: {
            isEditModalOpen, setIsEditModalOpen,
            userToEdit, setUserToEdit,
            isBlockModalOpen, setIsBlockModalOpen,
            userToBlock, setUserToBlock
        },
        actions: { changeRole, deleteUser, blockUser, unlockUser }
    }
}