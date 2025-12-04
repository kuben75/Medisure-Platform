import React, {useState, useEffect} from "react"
import Modal from "../ui/Modal.tsx"
import Button from "../ui/Button.tsx"
import type {IPricingPlan} from "../../types/pricing.types.ts";

const API_URL = `${import.meta.env.VITE_API_URL}/packages`

export const PackageFormModal = ({ isOpen, onClose, onPackageAdded, token, packageToEdit }: {
    isOpen: boolean
    onClose: () => void
    onPackageAdded: () => void
    token: string | null
    packageToEdit: IPricingPlan | null
}) => {
    const isEditMode = packageToEdit !== null

    const [name, setName] = useState('')

    const [price, setPrice] = useState('')
    const [priceValue, setPriceValue] = useState(0)

    const [category, setCategory] = useState('Individual')
    const [description, setDescription] = useState('')
    const [features, setFeatures] = useState('')

    const [averageRating, setAverageRating] = useState(0)
    const [reviews, setReviews] = useState(0)
    const [specialistsCount, setSpecialistsCount] = useState(0)
    const [facilitiesCount, setFacilitiesCount] = useState(0)

    const [hasDentalCare, setHasDentalCare] = useState(false)
    const [hasHospitalization, setHasHospitalization] = useState(false)
    const [hasRehabilitation, setHasRehabilitation] = useState(false)
    const [isFeatured, setIsFeatured] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isEditMode && packageToEdit) {
            setName(packageToEdit.name)
            setPrice(packageToEdit.price)
            setPriceValue(packageToEdit.priceValue || 0)
            setCategory(packageToEdit.category || 'Individual')
            setDescription(packageToEdit.description)
            setFeatures(packageToEdit.features ? packageToEdit.features.join(', ') : '')
            setAverageRating(packageToEdit.averageRating)
            setReviews(packageToEdit.reviews)

            setSpecialistsCount(packageToEdit.specialistsCount || 0)
            setFacilitiesCount(packageToEdit.facilitiesCount || 0)

            setHasDentalCare(packageToEdit.hasDentalCare || false)
            setHasHospitalization(packageToEdit.hasHospitalization || false)
            setHasRehabilitation(packageToEdit.hasRehabilitation || false)
            setIsFeatured(packageToEdit.isFeatured || false)
        } else {
            setName(''); setPrice(''); setPriceValue(0); setCategory('Individual')
            setDescription('') ;setFeatures('')
            setAverageRating(4.5); setReviews(0)
            setSpecialistsCount(10) ;setFacilitiesCount(100)
            setHasDentalCare(false); setHasHospitalization(false); setHasRehabilitation(false)
            setIsFeatured(false)
        }
    }, [packageToEdit, isOpen])

    const handlePriceValueChange = (val: string) => {
        const num = parseFloat(val)
        setPriceValue(num)
        if (!isEditMode) {
            setPrice(`${num} zł`)
        }
    }

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
            priceValue,
            category,
            description,
            features: features.split(',').map(f => f.trim()).filter(f => f),

            averageRating: Number(averageRating),
            reviews: Number(reviews),
            specialistsCount: Number(specialistsCount),
            facilitiesCount: Number(facilitiesCount),

            hasDentalCare,
            hasHospitalization,
            hasRehabilitation,
            isFeatured
        }

        const url = isEditMode ? `${API_URL}/${packageToEdit!.id}` : API_URL
        const method = isEditMode ? 'PUT' : 'POST'

        try {
            const bodyData = isEditMode ? { ...packageData, id: packageToEdit!.id } : packageData

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                let msg = "Wystąpił błąd zapisu."
                if (errorData.errors) {
                    msg = Object.values(errorData.errors).flat().join(', ')
                } else if (errorData.title) {
                    msg = errorData.title
                }
                throw new Error(msg)
            }

            onPackageAdded()
            onClose()

        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? "Edytuj pakiet" : "Dodaj nowy pakiet"}</h2>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Nazwa</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Kategoria</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg bg-white">
                            <option value="Individual">Indywidualny</option>
                            <option value="Family">Rodzinny</option>
                            <option value="Company">Dla Firmy</option>
                            <option value="Senior">Senior</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Cena (Wartość)</label>
                        <input type="number" value={priceValue} onChange={(e) => handlePriceValueChange(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Cena (Tekst)</label>
                        <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg" placeholder="np. 199 zł" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Opis</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" rows={2} />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Cechy (po przecinku)</label>
                    <input type="text" value={features} onChange={(e) => setFeatures(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" placeholder="Lekarz 24h, Badania krwi..." />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
                    <div>
                        <label className="block text-xs font-bold text-gray-500">Liczba Specjalistów</label>
                        <input type="number" value={specialistsCount} onChange={(e) => setSpecialistsCount(parseInt(e.target.value))} className="w-full mt-1 px-2 py-1 border rounded" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500">Liczba Placówek</label>
                        <input type="number" value={facilitiesCount} onChange={(e) => setFacilitiesCount(parseInt(e.target.value))} className="w-full mt-1 px-2 py-1 border rounded" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={hasDentalCare} onChange={(e) => setHasDentalCare(e.target.checked)} className="text-blue-600 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">Stomatologia</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={hasHospitalization} onChange={(e) => setHasHospitalization(e.target.checked)} className="text-blue-600 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">Szpital</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={hasRehabilitation} onChange={(e) => setHasRehabilitation(e.target.checked)} className="text-blue-600 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">Rehabilitacja</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer bg-yellow-50 p-1 rounded -ml-1">
                        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="text-yellow-600 rounded focus:ring-yellow-500" />
                        <span className="text-sm font-bold text-yellow-800">WYRÓŻNIONY (Hero)</span>
                    </label>
                </div>

                <div className="pt-2">
                    <Button type="submit" variant="primary" className="w-full !py-3" disabled={isLoading}>
                        {isLoading ? "Zapisywanie..." : (isEditMode ? "Zapisz zmiany" : "Stwórz pakiet")}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}