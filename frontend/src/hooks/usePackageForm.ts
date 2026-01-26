import React, {useEffect, useState} from "react"
import type {IPricingPlan} from "../types/pricing.types.ts"
import type {IPackageFormData} from "../types/ui.types.ts";
import {INITIAL_STATE} from "../constants/ui.ts";
import {SPECIALISTS_LIST} from "../constants/specialists.tsx";

const API_URL = `${import.meta.env.VITE_API_URL}/packages`

export const usePackageForm = (
    isOpen: boolean,
    packageToEdit: IPricingPlan | null,
    token: string | null,
    onSuccess: () => void
) => {
    const [formData, setFormData] = useState<IPackageFormData>({
        ...INITIAL_STATE,
        includedSpecializations: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (packageToEdit) {
                setFormData({
                    ...packageToEdit,
                    features: packageToEdit.features ? packageToEdit.features.join('; ') : '',
                    includedSpecializations: packageToEdit.includedSpecializations || '',
                    priceValue: packageToEdit.priceValue || 0,
                    specialistsCount: packageToEdit.specialistsCount || 0,
                    facilitiesCount: packageToEdit.facilitiesCount || 0,
                    hasDentalCare: packageToEdit.hasDentalCare || false,
                    hasHospitalization: packageToEdit.hasHospitalization || false,
                    hasRehabilitation: packageToEdit.hasRehabilitation || false,
                    isFeatured: packageToEdit.isFeatured || false,
                    category: packageToEdit.category || 'Indywidualny'
                } as IPackageFormData)
            } else {
                setFormData(INITIAL_STATE)
            }
        }
    }, [isOpen, packageToEdit])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => {
            if (type === 'checkbox')
                return { ...prev, [name]: (e.target as HTMLInputElement).checked }

            if (type === 'number') {
                const numValue = value === '' ? 0 : parseFloat(value);
                return { ...prev, [name]: numValue }
            }

            return { ...prev, [name]: value }
        })
    }

    const handlePriceValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
        setFormData(prev => ({
            ...prev,
            priceValue: val
        }))
    }

    const handleCategoryToggle = (category: string) => {
        const rawString = formData.includedSpecializations || "";

        let currentSpecs = rawString
            .split(';')
            .map(s => s.trim())
            .filter(Boolean)

        if (currentSpecs.includes(category))
            currentSpecs = currentSpecs.filter(c => c !== category)
         else
            currentSpecs.push(category)


        const uniqueSpecs = [...new Set(currentSpecs)]

        const newSpecString = uniqueSpecs.join(';')

        const realCount = SPECIALISTS_LIST.filter(s => uniqueSpecs.includes(s.category)).length;

        setFormData(prev => ({
            ...prev,
            includedSpecializations: newSpecString,
            specialistsCount: realCount
        }))
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) {
            setError("Błąd autoryzacji.")
            return
        }

        setIsLoading(true)
        setError(null)

        const payload = {
            ...formData,
            price: `${formData.priceValue} zł`,
            features: typeof formData.features === 'string'
                ? formData.features.split(';').map(f => f.trim()).filter(f => f)
                : formData.features,
            id: packageToEdit ? packageToEdit.id : undefined
        }

        const url = packageToEdit ? `${API_URL}/${packageToEdit.id}` : API_URL
        const method = packageToEdit ? 'PUT' : 'POST'

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : "Wystąpił błąd zapisu.")
            }

            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsLoading(false)
        }
    }

    return { formData, handleChange, handlePriceValueChange,handleCategoryToggle, handleSubmit, isLoading, error }
}