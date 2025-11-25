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