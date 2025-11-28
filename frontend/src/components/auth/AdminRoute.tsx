import { Navigate, Outlet } from 'react-router-dom'
import {useAuth} from "../../hooks/useAuth.ts";

const AdminRoute = () => {
    const { user, roles, isLoading } = useAuth()

    if (isLoading) return <div className="flex h-screen items-center justify-center">Ładowanie...</div>

    if (user && roles.includes('Admin')) return <Outlet />

    return <Navigate to="/login" replace />
}

export default AdminRoute