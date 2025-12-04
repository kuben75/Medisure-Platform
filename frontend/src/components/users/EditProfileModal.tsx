import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal.tsx'
import Button from '../ui/Button.tsx'

import type {IEditProfileModalProps} from "../../types/ui.types.ts";

import {useNotification} from "../../hooks/UseNotification.ts";
import {useAuth} from "../../hooks/useAuth.ts";

export default function EditProfileModal({ isOpen, onClose }: IEditProfileModalProps) {
    const { user, token, updateUser } = useAuth()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const {notify} = useNotification()
    const [birthDate, setBirthDate] = useState('')
    const [pesel, setPesel] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user && isOpen) {
            setFirstName(user.firstName || '')
            setLastName(user.lastName || '')
            setEmail(user.email || '')
            setPhoneNumber(user.phoneNumber || '')
            setPesel(user.pesel || '')
            if (user.birthDate)
                setBirthDate(user.birthDate.split('T')[0])
            else
                setBirthDate('')

        }
    }, [user, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        if(!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError("Imię, Nazwisko i Email są wymagane.")
            return
        }
        if (pesel && !/^\d{11}$/.test(pesel)) {
            setError("Numer PESEL musi składać się z 11 cyfr.")
            return
        }

        setIsLoading(true)
        setError(null)

        const payload = {
            firstName,
            lastName,
            email,
            phoneNumber: phoneNumber.trim() === '' ? null : phoneNumber.trim(),
            // Jeśli PESEL był zablokowany, wysyłamy stary (lub null, backend i tak pewnie zignoruje jeśli się nie zmienił),
            // ale jeśli był edytowalny (czyli pusty), to wysyłamy nową wartość.
            pesel: pesel.trim() === '' ? null : pesel.trim(),
            birthDate: birthDate ? new Date(birthDate).toISOString() : null
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/account/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errData = await response.json()
                let msg = errData.message || "Nie udało się zaaktualizować profilu."
                if(errData.errors) {
                    msg = Object.values(errData.errors).flat().join(', ')
                }
                throw new Error(msg)
            }

            const updatedUser = await response.json()

            updateUser(updatedUser)
            notify.success("Profil zaktualizowany!")
            onClose()
        } catch (err) {
            notify.error(err instanceof Error ? err.message : String(err))
        } finally {
            setIsLoading(false)
        }
    }

    // Blokady pól edycji
    const isBirthDateLocked = !!user?.birthDate
    const isPeselLocked = !!user?.pesel

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edytuj dane konta</h2>
            <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()} >
                {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Imię <span className="text-red-500">*</span></label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nazwisko <span className="text-red-500">*</span></label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telefon</label>
                        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex justify-between">
                            PESEL
                            {isPeselLocked && <span className="text-xs text-gray-400 font-normal flex items-center gap-1" title="Aby zmienić PESEL, skontaktuj się z administratorem">🔒 Tylko admin</span>}
                        </label>
                        <input
                            type="text"
                            maxLength={11}
                            value={pesel}
                            onChange={(e) => setPesel(e.target.value.replace(/\D/g, ''))}
                            disabled={isPeselLocked}
                            className={`w-full mt-1 px-3 py-2 border rounded-lg outline-none ${isPeselLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 flex justify-between">
                        Data urodzenia
                        {isBirthDateLocked && <span className="text-xs text-gray-400 font-normal flex items-center gap-1" title="Aby zmienić datę urodzenia, skontaktuj się z administratorem">🔒 Tylko admin</span>}
                    </label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        disabled={isBirthDateLocked}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg outline-none ${isBirthDateLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
                    />
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