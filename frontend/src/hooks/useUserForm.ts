import React, {useEffect, useState} from "react";
import {useAuth} from "./useAuth.ts";
import type {IUserDto, IUserFormData} from "../types/user.types.ts";

const API_URL_USERS = `${import.meta.env.VITE_API_URL}/admin/users`;

export const useUserForm = (
    isOpen: boolean,
    userToEdit: IUserDto | null,
    token: string | null,
    onSuccess: () => void
) => {
    const {user: currentUser, updateUser} = useAuth();

    const [formData, setFormData] = useState<IUserFormData>({
        firstName: '', lastName: '', email: '', phoneNumber: '', birthDate: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userToEdit && isOpen) {
            setFormData({
                firstName: userToEdit.firstName,
                lastName: userToEdit.lastName,
                email: userToEdit.email,
                phoneNumber: userToEdit.phoneNumber || '',
                birthDate: (userToEdit.birthDate && userToEdit.birthDate !== "0001-01-01T00:00:00")
                    ? userToEdit.birthDate.split('T')[0]
                    : ''
            });
        }
        setError(null);
    }, [userToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !userToEdit) {
            setError("Błąd autoryzacji.");
            return;
        }

        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
            setError("Pola Imię, Nazwisko i Email są wymagane.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const payload = {
            ...formData,
            phoneNumber: formData.phoneNumber.trim() === '' ? null : formData.phoneNumber,
            birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null
        };

        try {
            const response = await fetch(`${API_URL_USERS}/${userToEdit.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMsg = errorData.message || 'Nie udało się zaktualizować użytkownika.';
                if (errorData.errors) {
                    errorMsg = Object.values(errorData.errors).flat().join(', ');
                }
                throw new Error(errorMsg);
            }

            if (currentUser && currentUser.email === userToEdit.email) {
                const updatedSessionUser = {
                    email: payload.email,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    phoneNumber: payload.phoneNumber,
                    birthDate: payload.birthDate,
                    pesel: currentUser.pesel || null,
                    roles: currentUser.roles || [],
                    twoFactorEnabled: currentUser.twoFactorEnabled
                };

                if (updateUser) {
                    updateUser(updatedSessionUser);
                }
                localStorage.setItem('auth_user', JSON.stringify(updatedSessionUser));
            }

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd sieci.');
        } finally {
            setIsLoading(false);
        }
    }

    return {formData, handleChange, handleSubmit, isLoading, error}
}