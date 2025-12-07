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

    // Stany formularza
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [priceValue, setPriceValue] = useState(0)
    const [category, setCategory] = useState('Individual')
    const [description, setDescription] = useState('')
    const [features, setFeatures] = useState('')

    // Statystyki
    const [averageRating, setAverageRating] = useState(0)
    const [reviews, setReviews] = useState(0)
    const [specialistsCount, setSpecialistsCount] = useState(0)
    const [facilitiesCount, setFacilitiesCount] = useState(0)

    // Opcje
    const [hasDentalCare, setHasDentalCare] = useState(false)
    const [hasHospitalization, setHasHospitalization] = useState(false)
    const [hasRehabilitation, setHasRehabilitation] = useState(false)
    const [isFeatured, setIsFeatured] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
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
                // Reset dla nowego
                setName(''); setPrice(''); setPriceValue(0); setCategory('Individual')
                setDescription(''); setFeatures('')
                setAverageRating(4.5); setReviews(0)
                setSpecialistsCount(10); setFacilitiesCount(100)
                setHasDentalCare(false); setHasHospitalization(false); setHasRehabilitation(false)
                setIsFeatured(false)
            }
        }
    }, [packageToEdit, isOpen, isEditMode])

    // Auto-update pola tekstowego ceny
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
            setError("Błąd autoryzacji.")
            return
        }

        setIsLoading(true)
        setError(null)

        const packageData = {
            name, price, priceValue, category, description,
            features: features.split(',').map(f => f.trim()).filter(f => f),
            averageRating: Number(averageRating), reviews: Number(reviews),
            specialistsCount: Number(specialistsCount), facilitiesCount: Number(facilitiesCount),
            hasDentalCare, hasHospitalization, hasRehabilitation, isFeatured
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
                if (errorData.errors) msg = Object.values(errorData.errors).flat().join(', ')
                else if (errorData.title) msg = errorData.title
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

    // Helper styli inputów
    const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1";
    const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none transition-all text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edycja Pakietu" : "Kreator Pakietu"}</h2>
                <p className="text-sm text-gray-500">Uzupełnij szczegóły oferty medycznej.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-h-[65vh] overflow-y-auto px-1 custom-scrollbar">
                {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100">{error}</div>}

                {/* SEKCJA 1: PODSTAWOWE */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#4E61F6] uppercase tracking-wider border-b border-blue-100 pb-1">Podstawowe informacje</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className={labelClass}>Nazwa Pakietu</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className={labelClass}>Kategoria</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputClass} bg-white`}>
                                <option value="Individual">Indywidualny</option>
                                <option value="Family">Rodzinny</option>
                                <option value="Company">Dla Firmy</option>
                                <option value="Senior">Senior</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Opis</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} rows={2} />
                    </div>
                </div>

                {/* SEKCJA 2: CENA */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#4E61F6] uppercase tracking-wider border-b border-blue-100 pb-1">Cennik</h4>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <label className={labelClass}>Cena (Liczba)</label>
                            <input type="number" value={priceValue} onChange={(e) => handlePriceValueChange(e.target.value)} required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Cena (Wyświetlana)</label>
                            <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* SEKCJA 3: SZCZEGÓŁY */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#4E61F6] uppercase tracking-wider border-b border-blue-100 pb-1">Zakres i Statystyki</h4>

                    <div>
                        <label className={labelClass}>Cechy pakietu (oddziel przecinkami)</label>
                        <input type="text" value={features} onChange={(e) => setFeatures(e.target.value)} className={inputClass} />
                        <p className="text-[10px] text-gray-400 mt-1">Np.: Lekarz 24h, Badania krwi, E-Recepta</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Liczba Specjalistów</label>
                            <input type="number" value={specialistsCount} onChange={(e) => setSpecialistsCount(parseInt(e.target.value))} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Liczba Placówek</label>
                            <input type="number" value={facilitiesCount} onChange={(e) => setFacilitiesCount(parseInt(e.target.value))} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* SEKCJA 4: OPCJE */}
                <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Dodatkowe Opcje</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors">
                            <input type="checkbox" checked={hasDentalCare} onChange={(e) => setHasDentalCare(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                            <span className="ml-2 text-sm font-medium text-gray-700">Stomatologia</span>
                        </label>
                        <label className="flex items-center p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors">
                            <input type="checkbox" checked={hasHospitalization} onChange={(e) => setHasHospitalization(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                            <span className="ml-2 text-sm font-medium text-gray-700">Szpital</span>
                        </label>
                        <label className="flex items-center p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors">
                            <input type="checkbox" checked={hasRehabilitation} onChange={(e) => setHasRehabilitation(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                            <span className="ml-2 text-sm font-medium text-gray-700">Rehabilitacja</span>
                        </label>
                        <label className="flex items-center p-2 bg-yellow-50 rounded-lg border border-yellow-200 cursor-pointer hover:border-yellow-400 transition-colors">
                            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500" />
                            <span className="ml-2 text-sm font-bold text-yellow-800">Wyróżniony (Hero)</span>
                        </label>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <Button type="submit" variant="primary" className="w-full !py-3.5 text-base shadow-lg" disabled={isLoading}>
                        {isLoading ? "Zapisywanie..." : (isEditMode ? "Zapisz zmiany" : "Utwórz pakiet")}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}