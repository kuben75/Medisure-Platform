import Button from './Button.tsx';

import type {IFilterState, IPackageFiltersProps} from "../../types/pricing.types.ts";

export default function PackageFilters({ filters, setFilters }: IPackageFiltersProps) {

    const handleChange = (key: keyof IFilterState, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }))
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-8">
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Kategoria</h3>
                <div className="space-y-2">
                    {['all', 'Individual', 'Family', 'Senior', 'Company'].map(cat => (
                        <label key={cat} className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="category"
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                checked={filters.category === cat}
                                onChange={() => handleChange('category', cat)}
                            />
                            <span className="ml-2 text-gray-700 capitalize">
                                {cat === 'all' ? 'Wszystkie' : cat}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Maksymalna cena: <span className="text-blue-600">{filters.maxPrice} zł</span>
                </h3>
                <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.maxPrice}
                    onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 zł</span>
                    <span>1000 zł</span>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Dodatkowe opcje</h3>
                <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={filters.hasDental}
                            onChange={(e) => handleChange('hasDental', e.target.checked)}
                        />
                        <span className="ml-3 text-gray-700">Stomatologia</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={filters.hasHospital}
                            onChange={(e) => handleChange('hasHospital', e.target.checked)}
                        />
                        <span className="ml-3 text-gray-700">Hospitalizacja</span>
                    </label>
                </div>
            </div>

            <Button
                variant="primary"
                className="w-full !py-2 !text-sm"
                onClick={() => setFilters({
                    category: 'all',
                    maxPrice: 1000,
                    minSpecialists: 0,
                    hasDental: false,
                    hasHospital: false
                })}
            >
                Resetuj filtry
            </Button>
        </div>
    );
}