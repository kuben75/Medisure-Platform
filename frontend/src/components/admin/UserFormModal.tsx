import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal.tsx';
import Button from '../ui/Button.tsx';
import type {IUserDto} from "../../types/user.types.ts";
import {useAuth} from "../../hooks/useAuth.ts";
const API_URL_USERS = `${import.meta.env.VITE_API_URL}/admin/users`;

export const UserFormModal = ({ isOpen, onClose, onSaveSuccess, token, userToEdit }: {
    isOpen: boolean
    onClose: () => void
    onSaveSuccess: () => void
    token: string | null
    userToEdit: IUserDto | null
}) => {
    const { user: currentUser, updateUser } = useAuth()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [birthDate, setBirthDate] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (userToEdit && isOpen) {
            setFirstName(userToEdit.firstName);
            setLastName(userToEdit.lastName);
            setEmail(userToEdit.email);
            setPhoneNumber(userToEdit.phoneNumber || '');

            if (userToEdit.birthDate && userToEdit.birthDate !== "0001-01-01T00:00:00")
                setBirthDate(userToEdit.birthDate.split('T')[0])
             else
                setBirthDate('')

        }
        setError(null)
    }, [userToEdit, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !userToEdit) { setError("Błąd autoryzacji."); return; }

        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError("Pola Imię, Nazwisko i Email są wymagane.")
            return
        }

        setIsLoading(true)
        setError(null)

        const updatedUserData = {
            firstName,
            lastName,
            email,
            phoneNumber: phoneNumber.trim() === '' ? null : phoneNumber,
            birthDate: birthDate ? new Date(birthDate).toISOString() : null
        }

        try {
            const response = await fetch(`${API_URL_USERS}/${userToEdit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatedUserData)
            })

            if (!response.ok) {
                const errorData = await response.json();
                let errorMsg = errorData.message || errorData.title || 'Nie udało się zaktualizować użytkownika.';
                if(errorData.errors) {
                    errorMsg = Object.values(errorData.errors).flat().join(', ');
                }
                throw new Error(errorMsg);
            }
            if (currentUser && currentUser.email === userToEdit.email) {

                const updatedSessionUser = {
                    ...currentUser,
                    firstName: updatedUserData.firstName,
                    lastName: updatedUserData.lastName,
                    phoneNumber: updatedUserData.phoneNumber ?? null,
                    birthDate: updatedUserData.birthDate ?? null,
                    pesel: currentUser.pesel ?? null
                }

                if (updateUser)
                    updateUser(updatedSessionUser)

                localStorage.setItem('auth_user', JSON.stringify(updatedSessionUser))

            }

            onSaveSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edytuj użytkownika</h2>
            <form onSubmit={handleSubmit} className="space-y-4" onClick={e => e.stopPropagation()}>
                {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Imię <span className='text-red-500'>*</span></label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Nazwisko <span className='text-red-500'>*</span></label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email <span className='text-red-500'>*</span></label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none" />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Telefon (opcjonalnie)</label>
                        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none"  />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Data urodzenia</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" variant="primary" className="w-full !py-3" disabled={isLoading}>
                        {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}