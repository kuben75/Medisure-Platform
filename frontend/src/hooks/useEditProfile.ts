import {useAuth} from "./useAuth.ts";
import React, {useEffect, useState} from "react";
import {useNotification} from "./UseNotification.ts";
import type {IEditProfileModalProps} from "../types/ui.types.ts";


export const useEditProfile = ( { isOpen, onClose }: IEditProfileModalProps) => {
    const { user, token, updateUser } = useAuth()

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        birthDate: ''
    })

    const [currentPassword, setCurrentPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');

    const [step, setStep] = useState<'form' | 'password' | '2fa'>('form')

    const {notify} = useNotification()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                birthDate: user.birthDate ? user.birthDate.split('T')[0] : ''
            })

            setStep('form')
            setCurrentPassword('')
            setTwoFactorCode('')
            setError(null)
        }
    }, [user, isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if(!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
            setError("Imię, Nazwisko i Email są wymagane.")
            return
        }

        const isEmailChanged = formData.email.toLowerCase() !== user?.email?.toLowerCase();

        if (isEmailChanged) setStep('password')

        else performUpdate()

    }

    const handlePasswordStep = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!currentPassword) {
            setError("Wprowadź hasło")
            return
        }

        if (user?.twoFactorEnabled) setStep('2fa')
         else performUpdate()

    }

    const handle2FAStep = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!twoFactorCode || twoFactorCode.length !== 6) {
            setError("Wprowadź 6-cyfrowy kod")
            return
        }

        performUpdate()
    }

    const performUpdate = async () => {
        if (!token) return
        setIsLoading(true)
        setError(null)

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber.trim() === '' ? null : formData.phoneNumber.trim(),
            birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
            currentPassword: step !== 'form' ? currentPassword : null,
            twoFactorCode: user?.twoFactorEnabled && step !== 'form' ? twoFactorCode : null
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/account/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errData = await response.json()
                let msg = errData.message || "Błąd aktualizacji."
                if(errData.errors) msg = Object.values(errData.errors).flat().join(', ')

                const lowerMsg = msg.toLowerCase();
                if (lowerMsg.includes('hasł') || lowerMsg.includes('password')) {
                    setStep('password')
                    setError("Nieprawidłowe hasło. Spróbuj ponownie.")
                } else if (lowerMsg.includes('code') || lowerMsg.includes('kod') || lowerMsg.includes('2fa')) {
                    setError("Nieprawidłowy kod 2FA.")
                } else {
                    setError(msg)
                }

                throw new Error(msg)
            }

            const updatedUser = await response.json()

            const isEmailChangePending = updatedUser.emailChangePending || updatedUser.EmailChangePending

            if (isEmailChangePending) {
                notify.info("Na nowy adres wysłano link potwierdzający.")
                setFormData(prev => ({...prev, email: user?.email || ''}))
            } else {
                notify.success("Profil zaktualizowany!")
            }

            updateUser(updatedUser)
            onClose()

        } catch (err) {
            if (!error) setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsLoading(false)
        }
    }
    return {
        formData,
        handleInputChange,
        currentPassword, setCurrentPassword,
        twoFactorCode, setTwoFactorCode,
        step, setStep,
        isLoading,
        error, setError,
        handleFormSubmit,
        handlePasswordStep,
        handle2FAStep,
        user
    }
}