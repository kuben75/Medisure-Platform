import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal.tsx';
import Button from '../ui/Button.tsx';
import { useNotification } from "../../hooks/UseNotification.ts";
import type {IUserFormModalProps} from "../../types/user.types.ts";
const API_URL_USERS = `${import.meta.env.VITE_API_URL}/admin/users`;

export const UserFormModal = ({ isOpen, onClose, onSaveSuccess, token, userToEdit }: IUserFormModalProps) => {
    const { notify } = useNotification()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [birthDate, setBirthDate] = useState('')

    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (userToEdit && isOpen) {
            setFirstName(userToEdit.firstName);
            setLastName(userToEdit.lastName);
            setEmail(userToEdit.email);
            setPhoneNumber(userToEdit.phoneNumber || '');

            if (userToEdit.birthDate) {
                setBirthDate(userToEdit.birthDate.split('T')[0]);
            } else {
                setBirthDate('');
            }
        }
    }, [userToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !userToEdit) return;

        setIsLoading(true);

        const updatedUserData = {
            firstName,
            lastName,
            email,
            phoneNumber,
            birthDate: birthDate ? new Date(birthDate).toISOString() : null
        };

        try {
            const response = await fetch(`${API_URL_USERS}/${userToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedUserData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Nie udało się zaktualizować użytkownika.');
            }

            notify.success("Dane użytkownika zaktualizowane.");
            onSaveSuccess();
            onClose();

        } catch (err: any) {
            notify.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edytuj użytkownika (Admin)</h2>
            <form onSubmit={handleSubmit} className="space-y-4" onClick={e => e.stopPropagation()}>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Imię</label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Nazwisko</label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Adres email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none" />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Telefon</label>
                        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Data urodzenia</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}