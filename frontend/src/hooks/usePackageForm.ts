import React, {useEffect, useState} from "react"
import type {IPricingPlan} from "../types/pricing.types.ts"
import type {IPackageFormData} from "../types/ui.types.ts";

const API_URL = `${import.meta.env.VITE_API_URL}/packages`

const INITIAL_STATE: IPackageFormData = {
    name: '', price: '', priceValue: 0, category: 'Indywidualny',
    description: '', features: '',
    averageRating: 4.5, reviews: 0,
    specialistsCount: 10, facilitiesCount: 100,
    hasDentalCare: false, hasHospitalization: false, hasRehabilitation: false,
    isFeatured: false
}

export const usePackageForm = (
    isOpen: boolean,
    packageToEdit: IPricingPlan | null,
    token: string | null,
    onSuccess: () => void
) => {
    const [formData, setFormData] = useState<IPackageFormData>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (packageToEdit) {
                setFormData({
                    ...packageToEdit,
                    features: packageToEdit.features ? packageToEdit.features.join(', ') : '',
                    priceValue: packageToEdit.priceValue || 0,
                    specialistsCount: packageToEdit.specialistsCount || 0,
                    facilitiesCount: packageToEdit.facilitiesCount || 0,
                    hasDentalCare: packageToEdit.hasDentalCare || false,
                    hasHospitalization: packageToEdit.hasHospitalization || false,
                    hasRehabilitation: packageToEdit.hasRehabilitation || false,
                    isFeatured: packageToEdit.isFeatured || false
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

            if (type === 'number')
                return { ...prev, [name]: parseFloat(value) || 0 }

            return { ...prev, [name]: value }
        })
    }

    const handlePriceValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setFormData(prev => ({
            ...prev,
            priceValue: val,
            price: !packageToEdit ? `${val} zł` : prev.price
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setError("Błąd autoryzacji.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const payload = {
            ...formData,
            features: formData.features.split(',').map(f => f.trim()).filter(f => f),
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

    return { formData, handleChange, handlePriceValueChange, handleSubmit, isLoading, error }
}