export interface IDashboardStats {
    totalUsers: number;
    totalPackagesAvailable: number;
    activeSubscriptions: number;
    expiringSubscriptions: number;
}

export interface ISystemLog {
    id: number;
    action: string;
    description: string;
    user: string;
    userId: string | null;
    level: string;
    timestamp: string;
}

