export interface IDashboardStats {
    totalUsers: number;
    totalPackagesAvailable: number;
    activeSubscriptions: number;
    expiringSubscriptions: number;
}
export interface ISystemLog {
    id: number
    action: string
    description: string
    level: string
    userName: string
    createdAt: string
}