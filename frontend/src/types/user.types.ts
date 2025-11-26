export interface IUser {
    email: string,
    firstName: string,
    lastName: string
    phoneNumber?: string
}

export interface IUserDto {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    roles: string[]
}

export interface IUpdateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface IUserSubscription {
    id: number
    packageId: number
    packageName: string
    price: string
    startDate: string
    endDate: string
    status: string
    features: string[]
}