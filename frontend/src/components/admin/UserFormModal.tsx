import Button from "../ui/Button";
import Modal from "../ui/Modal";
import {useEffect, useState} from "react";

import type {IUpdateUserDto, IUserDto} from "../../types/user.types.ts";

export const UserFormModal = ({ isOpen, onClose, onSaveSuccess, token, userToEdit }: {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    token: string | null;
    userToEdit: IUserDto | null;
}) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const API_URL_USERS = "https://localhost:44333/api/admin/users";
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userToEdit) {
            setFirstName(userToEdit.firstName)
            setLastName(userToEdit.lastName)
            setEmail(userToEdit.email)
            setPhoneNumber(userToEdit.phoneNumber || '')
        }
    }, [userToEdit, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !userToEdit) {
            setError("Błąd autoryzacji lub brak danych użytkownika.");
            return
        }

        setIsLoading(true)
        setError(null)

        const updatedUserData: IUpdateUserDto = {
            firstName,
            lastName,
            email,
            phoneNumber
        }

        try {
            const response = await fetch(`${API_URL_USERS}/${userToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedUserData)
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Nie udało się zaktualizować użytkownika.');
            }

            onSaveSuccess();
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
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-center">{error}</div>}

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Imię</label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Nazwisko</label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Adres email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Numer telefonu</label>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div className="pt-2">
                    <Button type="submit" variant="primary" className="w-full !py-3" disabled={isLoading}>
                        {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};