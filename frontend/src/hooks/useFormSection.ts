import React, {useState} from "react";
import {useNotification} from "./UseNotification.ts";
import {handleApiError} from "../utils/apiErrorHandler.ts";

export const useFormSection = () => {
    const [isChecked, setIsChecked] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { notify } = useNotification()

    const [formData, setFormData] = useState({
        name: '', surname: '', email: '', phone: '', topic: 'Oferta Indywidualna', message: ''
    })

    const [errors, setErrors] = useState<Record<string, boolean>>({})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: Record<string, boolean> = {}
        let specificErrorMsg = ""

        if (!formData.name.trim()) newErrors.name = true
        if (!formData.surname.trim()) newErrors.surname = true
        if (!formData.email) newErrors.email = true
        if (!formData.phone) newErrors.phone = true


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = true
            specificErrorMsg = "Podany adres e-mail jest nieprawidłowy."
        }

        if (formData.phone && formData.phone.length < 9) {
            newErrors.phone = true
            if (!specificErrorMsg) specificErrorMsg = "Numer telefonu jest za krótki (min. 9 cyfr)."
        }

        if (!isChecked) {
            newErrors.agreement = true
            if (!specificErrorMsg) specificErrorMsg = "Musisz zaakceptować politykę prywatności."
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)

            if (specificErrorMsg)
                notify.error(specificErrorMsg)
            else
                notify.error("Uzupełnij wymagane pola zaznaczone na czerwono.")

            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) throw await response.json()

            notify.success("Wiadomość wysłana! Sprawdź skrzynkę pocztową, wkrótce się odezwiemy.")

            setFormData({ name: '', surname: '', email: '', phone: '', topic: 'Oferta Indywidualna', message: '' })
            setIsChecked(false)
            setErrors({})

        } catch (err) {
            handleApiError(err, notify)
        } finally {
            setIsLoading(false)
        }
    }

    const getInputClass = (field: string) =>
        `w-full px-4 py-3 border rounded-xl focus:outline-none transition-colors ${errors[field] ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-[#4E61F6] bg-gray-50 focus:bg-white'}`;
    return {
        formData,
        setFormData,
        errors,
        setErrors,
        isChecked,
        setIsChecked,
        isLoading,
        handleSubmit,
        getInputClass
    }
}