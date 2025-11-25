import React, { useState, useEffect } from 'react'
import {useAuth} from "../../context/AuthContext.tsx"
import Modal from '../ui/Modal.tsx'
import Button from '../ui/Button.tsx'

import type {IEditProfileModalProps} from "../../types/ui.types.ts";
import {useNotification} from "../../context/NotificationContext.tsx";

export default function EditProfileModal({ isOpen, onClose }: IEditProfileModalProps) {
    const { user, token, updateUser } = useAuth()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const {notify} = useNotification()

    useEffect(() => {
        if (user && isOpen) {
            setFirstName(user.firstName || '')
            setLastName(user.lastName || '')
            setEmail(user.email || '')
            setPhoneNumber(user.phoneNumber || '')
        }
    }, [user, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("https://localhost:44333/api/account/profile", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ firstName, lastName, email, phoneNumber })
            })

            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.Message || "Nie udało się zaktualizować profilu.")
            }

            const updatedUser = await response.json()

            updateUser(updatedUser)

            notify.success("Profil zaktualizowany!")
            onClose()
        } catch (err: any) {
            notify.error(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edytuj swoje dane</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Imię</label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nazwisko</label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Numer telefonu</label>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
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