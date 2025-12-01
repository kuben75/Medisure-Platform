import Button from '../ui/Button.tsx';
import type { IFilterState, IPackageFiltersProps } from "../../types/pricing.types.ts";

const SortIcon = () => <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>;
const FilterIcon = () => <svg className="w-5 h-5 mr-2 text-[#4E61F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>;

export default function PackageFilters({ filters, setFilters }: IPackageFiltersProps) {

    const handleChange = (key: keyof IFilterState, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        setFilters({
            category: 'all',
            maxPrice: 1000,
            minSpecialists: 0,
            minFacilities: 0,
            hasDental: false,
            hasHospital: false,
            hasRehabilitation: false,
            sortOrder: 'default'
        })
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">

            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center">
                    <FilterIcon />
                    <h3 className="font-bold text-gray-800 text-lg">Filtrowanie</h3>
                </div>
                <button
                    onClick={handleReset}
                    className="text-xs text-gray-400 hover:text-[#4E61F6] font-medium transition-colors"
                >
                    Wyczyść wszystko
                </button>
            </div>

            <div className="mb-8">
                <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <SortIcon /> Sortuj według
                </label>
                <div className="relative">
                    <select
                        value={filters.sortOrder}
                        onChange={(e) => handleChange('sortOrder', e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent font-medium text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="default">Domyślnie (Rekomendowane)</option>
                        <option value="price_asc">Cena: od najniższej</option>
                        <option value="price_desc">Cena: od najwyższej</option>
                        <option value="rating_desc">Ocena: od najwyższej</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h4 className="font-bold text-gray-800 mb-3 text-sm">Rodzaj pakietu</h4>
                <div className="space-y-2">
                    {[
                        { val: 'all', label: 'Wszystkie' },
                        { val: 'Individual', label: 'Indywidualny' },
                        { val: 'Family', label: 'Rodzinny' },
                        { val: 'Senior', label: 'Senior' },
                        { val: 'Company', label: 'Dla Firm' }
                    ].map((opt) => (
                        <label key={opt.val} className="flex items-center cursor-pointer group">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-all ${filters.category === opt.val ? 'border-[#4E61F6]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                {filters.category === opt.val && <div className="w-2.5 h-2.5 bg-[#4E61F6] rounded-full" />}
                            </div>
                            <input
                                type="radio"
                                name="category"
                                className="hidden"
                                checked={filters.category === opt.val}
                                onChange={() => handleChange('category', opt.val)}
                            />
                            <span className={`text-sm ${filters.category === opt.val ? 'text-[#4E61F6] font-bold' : 'text-gray-600 group-hover:text-gray-800'}`}>
                                {opt.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-6 mb-8">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Maks. cena</label>
                        <span className="text-sm font-bold text-[#4E61F6]">{filters.maxPrice} zł</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={filters.maxPrice}
                        onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4E61F6]"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Min. liczba lekarzy</label>
                        <span className="text-sm font-bold text-[#4E61F6]">{filters.minSpecialists}+</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="60"
                        step="5"
                        value={filters.minSpecialists}
                        onChange={(e) => handleChange('minSpecialists', Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4E61F6]"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Min. liczba placówek</label>
                        <span className="text-sm font-bold text-[#4E61F6]">{filters.minFacilities}+</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="2000"
                        step="100"
                        value={filters.minFacilities}
                        onChange={(e) => handleChange('minFacilities', Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4E61F6]"
                    />
                </div>
            </div>

            <div className="mb-8">
                <h4 className="font-bold text-gray-800 mb-3 text-sm">Zawartość pakietu</h4>
                <div className="space-y-3">
                    {[
                        { key: 'hasDental', label: 'Stomatologia' },
                        { key: 'hasHospital', label: 'Hospitalizacja' },
                        { key: 'hasRehabilitation', label: 'Rehabilitacja' }
                    ].map((opt) => (
                        <label key={opt.key} className="flex items-center cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-all ${filters[opt.key as keyof IFilterState] ? 'bg-[#4E61F6] border-[#4E61F6]' : 'bg-white border-gray-300 group-hover:border-gray-400'}`}>
                                {filters[opt.key as keyof IFilterState] && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={!!filters[opt.key as keyof IFilterState]}
                                onChange={(e) => handleChange(opt.key as keyof IFilterState, e.target.checked)}
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <Button
                variant="primary"
                className="w-full !py-3 !text-sm border-gray-300 hover:border-[#4E61F6]"
                onClick={handleReset}
            >
                Zresetuj wszystkie filtry
            </Button>
        </div>
    )
}