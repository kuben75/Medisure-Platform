import Modal from "./Modal.tsx";
import Button from "../Button.tsx";
import {usePackageForm} from "../../../hooks/usePackageForm.ts";
import type {IPackageFormModalProps} from "../../../types/ui.types.ts";
import CheckIcon from "../../icons/CheckIcon.tsx";
import {AVAILABLE_CATEGORIES} from "../../../constants/ui.ts";

export const PackageFormModal = ({isOpen, onClose, onPackageAdded, token, packageToEdit}: IPackageFormModalProps) => {
    const isEditMode = !!packageToEdit;
    const {
        formData,
        handleChange,
        handlePriceValueChange,
        handleCategoryToggle,
        handleSubmit,
        isLoading,
        error
    } = usePackageForm(isOpen, packageToEdit, token, () => {
        onPackageAdded();
        onClose();
    });

    const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide";
    const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4E61F6]/20 focus:border-[#4E61F6] outline-none transition-all text-sm font-medium bg-white";

    const currentSpecs = formData.includedSpecializations ? formData.includedSpecializations.split(';').filter(Boolean) : [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-6xl w-full">
            <div className="mb-6 border-b border-gray-100 pb-5 flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{isEditMode ? "Edycja Pakietu" : "Nowy Pakiet"}</h2>
                    <p className="text-sm text-gray-500 mt-1">Skonfiguruj parametry oferty i zakres usług.</p>
                </div>
                <div
                    className="bg-blue-50 text-[#4E61F6] px-4 py-1.5 mt-4 rounded-full text-xs font-bold uppercase tracking-wider">
                    {isEditMode ? "Tryb Edycji" : "Tworzenie"}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="custom-scrollbar pr-2 max-h-[75vh] overflow-y-auto">
                {error && (
                    <div
                        className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                        ⚠️ {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">

                    <div className="space-y-8">

                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span
                                    className="w-6 h-6 rounded bg-[#4E61F6] text-white flex items-center justify-center text-xs">1</span>
                                Informacje Główne
                            </h4>

                            <div className="space-y-5">
                                <div>
                                    <label className={labelClass}>Nazwa Pakietu</label>
                                    <input name="name" type="text" value={formData.name} onChange={handleChange}
                                           required className={inputClass} />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>Kategoria</label>
                                        <select name="category" value={formData.category} onChange={handleChange}
                                                className={inputClass}>
                                            <option value="Indywidualny">Indywidualny</option>
                                            <option value="Rodzinny">Rodzinny</option>
                                            <option value="Biznesowy">Biznesowy</option>
                                            <option value="Senior">Senior</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Cena Miesięczna</label>
                                        <div className="relative">
                                            <input name="priceValue" type="number" step="0.01"
                                                   value={formData.priceValue} onChange={handlePriceValueChange}
                                                   required
                                                   className={`${inputClass} pl-4 pr-12 text-[#4E61F6] font-bold`}/>
                                            <span
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">PLN</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Krótki Opis</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange}
                                              className={inputClass} rows={3}
                                              />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Lista Cech (Features)</label>
                            <div className="relative">
                                <textarea
                                    name="features" value={formData.features} onChange={handleChange}
                                    className={`${inputClass} text-sm leading-relaxed min-h-[140px]`}
                                />
                                <div
                                    className="absolute bottom-3 right-3 text-[10px] text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                    Oddzielaj średnikiem (;)
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Placówki (Liczba)</label>
                                <input name="facilitiesCount" type="number" value={formData.facilitiesCount}
                                       onChange={handleChange} className={inputClass}/>
                            </div>
                            <div className="opacity-70">
                                <label className={labelClass}>Lekarze (Auto)</label>
                                <input value={formData.specialistsCount} readOnly
                                       className={`${inputClass} bg-gray-100 cursor-not-allowed`}/>
                            </div>
                        </div>

                    </div>

                    <div className="space-y-8 flex flex-col h-full">

                        <div className="flex-grow flex flex-col">
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span
                                    className="w-6 h-6 rounded bg-[#4E61F6] text-white flex items-center justify-center text-xs">2</span>
                                Zarządzanie Zakresem
                            </h4>

                            <div
                                className="bg-white border-2 border-gray-100 rounded-2xl p-1 flex-grow flex flex-col shadow-sm">
                                <div
                                    className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Dostępne specjalizacje</span>
                                    <span
                                        className="text-xs font-bold text-[#4E61F6] bg-blue-100 px-2 py-1 rounded">Wybrano: {currentSpecs.length}</span>
                                </div>

                                <div className="p-5 overflow-y-auto custom-scrollbar max-h-[350px]">
                                    <div className="flex flex-wrap gap-2">
                                        {AVAILABLE_CATEGORIES.map(cat => {
                                            const isSelected = currentSpecs.includes(cat);
                                            return (
                                                <button
                                                    key={cat} type="button" onClick={() => handleCategoryToggle(cat)}
                                                    className={`
                                                        px-4 py-2.5 rounded-xl text-xs font-bold transition-all border select-none flex items-center gap-2
                                                        ${isSelected
                                                        ? 'bg-[#4E61F6] text-white border-[#4E61F6] shadow-md shadow-blue-500/20 transform scale-105'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }
                                                    `}
                                                >
                                                    {isSelected && <CheckIcon className={"w-4 h-4"}/>}
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4">Opcje Dodatkowe</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <ModernCheckbox label="Stomatologia" desc="Leczenie zębów" name="hasDentalCare"
                                                checked={formData.hasDentalCare} onChange={handleChange}/>
                                <ModernCheckbox label="Szpital" desc="Hospitalizacja" name="hasHospitalization"
                                                checked={formData.hasHospitalization} onChange={handleChange}/>
                                <ModernCheckbox label="Rehabilitacja" desc="Fizjoterapia" name="hasRehabilitation"
                                                checked={formData.hasRehabilitation} onChange={handleChange}/>
                                <ModernCheckbox label="Wyróżniony" desc="Promuj pakiet" name="isFeatured"
                                                checked={formData.isFeatured} onChange={handleChange} variant="yellow"/>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-4 bg-white sticky bottom-0 z-10">
                    <Button type="button" variant="secondary" onClick={onClose} className="px-8 py-3 text-sm">
                        Anuluj
                    </Button>
                    <Button type="submit" variant="primary" className="px-10 py-3 text-sm shadow-xl shadow-blue-600/20"
                            disabled={isLoading}>
                        {isLoading ? "Zapisywanie..." : (isEditMode ? "Zapisz Zmiany" : "Utwórz Pakiet")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

const ModernCheckbox = ({label, desc, name, checked, onChange, variant = 'blue', icon}: any) => {
    const isYellow = variant === 'yellow';
    const activeClass = isYellow ? "bg-yellow-50 border-yellow-400 ring-1 ring-yellow-400" : "bg-blue-50 border-[#4E61F6] ring-1 ring-[#4E61F6]";
    const inactiveClass = "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50";

    return (
        <label
            className={`relative flex items-center gap-4 p-1 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${checked ? activeClass : inactiveClass}`}>
            <input name={name} type="checkbox" checked={checked} onChange={onChange} className="hidden"/>

            <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 text-lg shadow-sm border ${checked ? (isYellow ? "bg-yellow-400 border-yellow-400 text-white" : "bg-[#4E61F6] border-[#4E61F6] text-white") : "bg-white border-gray-200 text-gray-400"}`}>
                {checked ? <CheckIcon className={"w-4 h-4"}/> : <span>{icon}</span>}
            </div>

            <div className="flex flex-col">
                <span
                    className={`text-sm font-bold ${checked ? (isYellow ? "text-yellow-900" : "text-[#4E61F6]") : "text-gray-700"}`}>
                    {label}
                </span>
                <span className="text-xs text-gray-400 font-medium">{desc}</span>
            </div>
        </label>
    );
};