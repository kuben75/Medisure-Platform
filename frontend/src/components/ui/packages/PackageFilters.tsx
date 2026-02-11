import type {IFilterState, IPackageFiltersProps} from "../../../types/pricing.types.ts";
import SearchIcon from "../../icons/SearchIcon.tsx";

const SortIcon = () => <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
</svg>;
const FilterIcon = () => <svg className="w-5 h-5 mr-2 text-[#4E61F6]" fill="none" stroke="currentColor"
                              viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
</svg>;

export default function PackageFilters({filters, setFilters}: IPackageFiltersProps) {

    const handleChange = (key: keyof IFilterState, value: any) =>
        setFilters((prev) => ({...prev, [key]: value}));


    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 space-y-8">

            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div className="flex items-center"><FilterIcon/><h3
                    className="font-bold text-gray-800 text-lg">Filtrowanie</h3></div>
                <button onClick={() => setFilters({
                    category: 'all',
                    maxPrice: 2000,
                    minSpecialists: 0,
                    minFacilities: 0,
                    hasDental: false,
                    hasHospital: false,
                    hasRehabilitation: false,
                    sortOrder: 'default',
                    searchQuery: '',
                    showYearlyPrice: false
                })} className="text-xs text-gray-400 hover:text-[#4E61F6]">Reset
                </button>
            </div>
            <div>
                <div>
                    <div className="relative">
                        <input
                            type="text"
                            value={filters.searchQuery}
                            onChange={(e) => handleChange('searchQuery', e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4E61F6]"
                            placeholder="Wyszukaj pakiet..."
                        />
                        <div className="absolute left-3 top-2.5"><SearchIcon className="w-4 h-4 text-gray-400"/></div>
                    </div>
                </div>

            </div>
            <div>
                <label
                    className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"><SortIcon/> Sortuj</label>
                <select value={filters.sortOrder} onChange={(e) => handleChange('sortOrder', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4E61F6]">
                    <option value="default">Domyślnie</option>
                    <option value="price_asc">Cena: rosnąco</option>
                    <option value="price_desc">Cena: malejąco</option>
                    <option value="rating_desc">Ocena: od najwyższej</option>
                    <option value="rating_asc">Ocena: od najniższej</option>
                </select>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-sm font-bold text-gray-700">Cena roczna</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={filters.showYearlyPrice}
                           onChange={(e) => handleChange('showYearlyPrice', e.target.checked)}
                           className="sr-only peer"/>
                    <div
                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E61F6]"></div>
                </label>
            </div>

            <div>
                <h4 className="font-bold text-gray-800 mb-3 text-sm">Kategoria</h4>
                <div className="space-y-2">
                    {['all', 'Indywidualny', 'Rodzinny', 'Senior', 'Biznesowy'].map((cat) => (
                        <label key={cat} className="flex items-center cursor-pointer">
                            <input type="radio" name="category" className="text-[#4E61F6] focus:ring-[#4E61F6]"
                                   checked={filters.category === cat} onChange={() => handleChange('category', cat)}/>
                            <span
                                className="ml-2 text-sm text-gray-600 capitalize">{cat === 'all' ? 'Wszystkie' : cat}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1"><label className="text-xs font-bold text-gray-500">Max.
                        Cena ({filters.showYearlyPrice ? 'rok' : 'mc'})</label><span
                        className="text-xs font-bold text-[#4E61F6]">{filters.maxPrice} zł</span></div>
                    <input type="range" min="0" max={filters.showYearlyPrice ? 12000 : 1000}
                           step={filters.showYearlyPrice ? 100 : 10} value={filters.maxPrice}
                           onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
                           className="w-full accent-[#4E61F6]"/>
                </div>
                <div>
                    <div className="flex justify-between mb-1"><label className="text-xs font-bold text-gray-500">Min.
                        Lekarzy</label><span
                        className="text-xs font-bold text-[#4E61F6]">{filters.minSpecialists}</span></div>
                    <input type="range" min="0" max="30" step="3" value={filters.minSpecialists}
                           onChange={(e) => handleChange('minSpecialists', Number(e.target.value))}
                           className="w-full accent-[#4E61F6]"/>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <div className="flex justify-between mb-1"><label className="text-xs font-bold text-gray-500">Min.
                        Placówek</label><span
                        className="text-xs font-bold text-[#4E61F6]">{filters.minFacilities}</span></div>
                    <input type="range" min="0" max="2000" step="50" value={filters.minFacilities}
                           onChange={(e) => handleChange('minFacilities', Number(e.target.value))}
                           className="w-full accent-[#4E61F6]"/>
                </div>
            </div>

            <div>
                <h4 className="font-bold text-gray-800 mb-3 text-sm">Opcje dodatkowe</h4>
                <div className="space-y-2 text-sm">
                    <label className="flex items-center"><input type="checkbox" checked={filters.hasDental}
                                                                onChange={(e) => handleChange('hasDental', e.target.checked)}
                                                                className="mr-2 accent-[#4E61F6]"/> Stomatologia</label>
                    <label className="flex items-center"><input type="checkbox" checked={filters.hasHospital}
                                                                onChange={(e) => handleChange('hasHospital', e.target.checked)}
                                                                className="mr-2 accent-[#4E61F6]"/> Szpital</label>
                    <label className="flex items-center"><input type="checkbox" checked={filters.hasRehabilitation}
                                                                onChange={(e) => handleChange('hasRehabilitation', e.target.checked)}
                                                                className="mr-2 accent-[#4E61F6]"/> Rehabilitacja</label>
                </div>
            </div>
        </div>
    );
}