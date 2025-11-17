import React, {useEffect, useState} from "react";
import type {IPricingPlan} from "../../types/types.ts";
import Modal from "../ui/Modal.tsx";
import Button from "../ui/Button.tsx";

export const PackageFormModal = ({ isOpen, onClose, onSaveSuccess, token, packageToEdit }: {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    token: string | null;
    packageToEdit: IPricingPlan | null;
}) => {

    const isEditing = packageToEdit !== null;
    const API_URL = "https://localhost:44333/api/packages";

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [features, setFeatures] = useState('');
    const [averageRating, setAverageRating] = useState(0);
    const [reviews, setReviews] = useState(0);
    const [isFeatured, setIsFeatured] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isEditing) {
            setName(packageToEdit.name)
            setPrice(packageToEdit.price)
            setDescription(packageToEdit.description)
            setFeatures(packageToEdit.features.join(', '))
            setAverageRating(packageToEdit.averageRating)
            setReviews(packageToEdit.reviews)
            setIsFeatured(packageToEdit.isFeatured || false)
        } else {
            setName('')
            setPrice('')
            setDescription('')
            setFeatures('')
            setAverageRating(0)
            setReviews(0)
            setIsFeatured(false)
        }
    }, [packageToEdit, isEditing, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) {
            setError("Błąd autoryzacji. Zaloguj się ponownie.")
            return
        }

        setIsLoading(true)
        setError(null)

        const packageData = {
            name,
            price,
            description,
            features: features.split(',').map(f => f.trim()).filter(f => f),
            averageRating: Number(averageRating),
            reviews: Number(reviews),
            isFeatured
        }

        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ? `${API_URL}/${packageToEdit.id}` : API_URL

        const bodyPayload = isEditing
            ? JSON.stringify({ id: packageToEdit.id, ...packageData })
            : JSON.stringify(packageData);

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: bodyPayload
            })

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Błąd z backendu:", errorData);
                throw new Error(errorData.title || 'Nie udało się zapisać pakietu. Sprawdź dane.')
            }

            onSaveSuccess();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEditing ? "Edytuj pakiet" : "Dodaj nowy pakiet"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-center">{error}</div>}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Nazwa pakietu</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Cena (np. "199 zł")</label>
                    <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Funkcje (oddzielone przecinkami)</label>
                    <input type="text" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Funkcja 1, Funkcja 2" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Opis</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Rating (0-5)</label>
                        <input type="number" step="0.1" value={averageRating} onChange={(e) => setAverageRating(parseFloat(e.target.value))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Liczba opinii</label>
                        <input type="number" value={reviews} onChange={(e) => setReviews(parseInt(e.target.value))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>

                <div className="flex items-center">
                    <input id="isFeatured" type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">Wyróżniony?</label>
                </div>

                <div className="pt-2">
                    <Button type="submit" variant="primary" className="w-full !py-3" disabled={isLoading}>
                        {isLoading ? "Zapisywanie..." : (isEditing ? "Zapisz zmiany" : "Stwórz pakiet")}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}