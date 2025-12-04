import React, {useState} from 'react';
import Modal from '../ui/Modal.tsx';
import Button from '../ui/Button.tsx';
import {useAuth} from '../../hooks/useAuth.ts';
import {useNotification} from '../../hooks/UseNotification.ts';
import type {ChangePasswordModalProps} from "../../types/auth.types.ts";

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const { token } = useAuth()
    const { notify } = useNotification()

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            notify.error("Nowe hasła muszą być identyczne.")
            return
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/
        if (!passwordRegex.test(newPassword)) {
            notify.error("Hasło nie spełnia wymagań bezpieczeństwa.")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/account/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmNewPassword: confirmPassword
                })
            })

            if (!response.ok) {
                const data = await response.json()
                let errorMsg = "Błąd zmiany hasła."
                if (data.errors) {
                    if (Array.isArray(data.errors))
                        errorMsg = data.errors.map((e: any) => e.description).join(', ')
                     else
                        errorMsg = Object.values(data.errors).flat().join(', ')

                } else if (data.Message) {
                    errorMsg = data.Message
                }
                throw new Error(errorMsg)
            }

            notify.success("Hasło zostało zmienione pomyślnie.")
            onClose()
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')

        } catch (err: any) {
            notify.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Zmień hasło</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Obecne hasło</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nowe hasło</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none"
                    />
                    <ul className="text-xs text-gray-500 mt-2 list-disc pl-4 space-y-1">
                        <li>Minimum 8 znaków</li>
                        <li>Przynajmniej jedna wielka litera (A-Z)</li>
                        <li>Przynajmniej jedna mała litera (a-z)</li>
                        <li>Przynajmniej jedna cyfra (0-9)</li>
                        <li>Przynajmniej jeden znak specjalny (np. !@#$%^&*)</li>
                    </ul>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Powtórz nowe hasło</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none"
                    />
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full py-3" disabled={isLoading}>
                        {isLoading ? "Zmienianie..." : "Zmień hasło"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}