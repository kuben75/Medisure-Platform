import Modal from "./Modal.tsx";
import Button from "../Button.tsx";
import {usePackageForm} from "../../../hooks/usePackageForm.ts";
import type {IPackageFormModalProps} from "../../../types/ui.types.ts";

export const PackageFormModal = ({ isOpen, onClose, onPackageAdded, token, packageToEdit }: IPackageFormModalProps) => {
    const isEditMode = !!packageToEdit

    const { formData, handleChange, handlePriceValueChange, handleSubmit, isLoading, error } = usePackageForm(
        isOpen,
        packageToEdit,
        token,
        () => { onPackageAdded(); onClose() }
    )

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

                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#4E61F6] uppercase tracking-wider border-b border-blue-100 pb-1">Podstawowe informacje</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className={labelClass}>Nazwa Pakietu</label>
                            <input name="name" type="text" value={formData.name} onChange={handleChange} required className={inputClass} />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className={labelClass}>Kategoria</label>
                            <select name="category" value={formData.category} onChange={handleChange} className={`${inputClass} bg-white`}>
                                <option value="Indywidualny">Indywidualny</option>
                                <option value="Rodzinny">Rodzinny</option>
                                <option value="Biznesowy">Dla Firmy</option>
                                <option value="Senior">Senior</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Opis</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className={inputClass} rows={2} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#4E61F6] uppercase tracking-wider border-b border-blue-100 pb-1">Cennik</h4>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <label className={labelClass}>Cena (Liczba)</label>
                            <input name="priceValue" type="number" value={formData.priceValue} onChange={handlePriceValueChange} required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Cena (Wyświetlana)</label>
                            <input name="price" type="text" value={formData.price} onChange={handleChange} required className={inputClass} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#4E61F6] uppercase tracking-wider border-b border-blue-100 pb-1">Zakres i Statystyki</h4>
                    <div>
                        <label className={labelClass}>Cechy pakietu (oddziel przecinkami)</label>
                        <input name="features" type="text" value={formData.features} onChange={handleChange} className={inputClass} />
                        <p className="text-[10px] text-gray-400 mt-1">Np.: Lekarz 24h, Badania krwi, E-Recepta</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Liczba Specjalistów</label>
                            <input name="specialistsCount" type="number" value={formData.specialistsCount} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Liczba Placówek</label>
                            <input name="facilitiesCount" type="number" value={formData.facilitiesCount} onChange={handleChange} className={inputClass} />
                        </div>
                    </div>
                </div>

                <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Dodatkowe Opcje</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <Checkbox label="Stomatologia" name="hasDentalCare" checked={formData.hasDentalCare} onChange={handleChange} color="blue" />
                        <Checkbox label="Szpital" name="hasHospitalization" checked={formData.hasHospitalization} onChange={handleChange} color="blue" />
                        <Checkbox label="Rehabilitacja" name="hasRehabilitation" checked={formData.hasRehabilitation} onChange={handleChange} color="blue" />
                        <Checkbox label="Wyróżniony (Hero)" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} color="yellow" />
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
const Checkbox = ({ label, name, checked, onChange, color }: any) => {
    const colorClasses = color === 'yellow'
        ? "text-yellow-600 focus:ring-yellow-500 border-yellow-200 hover:border-yellow-400 bg-yellow-50"
        : "text-blue-600 focus:ring-blue-500 border-gray-200 hover:border-blue-400 bg-white";

    return (
        <label className={`flex items-center p-2 rounded-lg border cursor-pointer transition-colors ${color === 'yellow' ? 'bg-yellow-50' : 'bg-white'}`}>
            <input name={name} type="checkbox" checked={checked} onChange={onChange} className={`w-4 h-4 rounded ${colorClasses}`} />
            <span className={`ml-2 text-sm ${color === 'yellow' ? 'font-bold text-yellow-800' : 'font-medium text-gray-700'}`}>{label}</span>
        </label>
    )
}