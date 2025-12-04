import  { useState } from 'react';
import { SPECIALISTS_LIST } from '../constants/specialists.tsx';

const CATEGORIES = ["Wszystkie", ...new Set(SPECIALISTS_LIST.map(s => s.category))];

export default function SpecialistsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Wszystkie");

    const filtered = SPECIALISTS_LIST.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "Wszystkie" || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
    })

    return (
            <div className="min-h-screen bg-slate-50 py-12 md:py-24 px-4">
                <div className="max-w-6xl mx-auto">

                    <div className="text-center mb-12">
                        <span className="text-[#4E61F6] font-bold tracking-wider uppercase text-sm bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                            Nasza kadra
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-6 mb-4">
                            Baza Wiedzy o Specjalistach
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Sprawdź, do jakich lekarzy zyskasz dostęp w ramach naszych pakietów medycznych.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-6 mb-12">

                        <div className="relative w-full max-w-lg">
                            <input
                                type="text"
                                placeholder="Szukaj specjalisty (np. kardiolog)..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full px-6 py-3 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#4E61F6] outline-none text-lg pl-12 bg-white"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                        selectedCategory === cat
                                            ? 'bg-[#4E61F6] text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {filtered.map((spec, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 flex flex-col items-center text-center group cursor-default relative overflow-hidden">

                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-[#4E61F6] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="group-hover:scale-110 transition-transform duration-300 bg-blue-50 p-4 rounded-full mb-4 border border-blue-100">
                                    {spec.icon}
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm md:text-base">{spec.name}</h3>
                                <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide">{spec.category}</p>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">Nie znaleziono specjalisty.</p>
                            <button onClick={() => {setSearchTerm(''); setSelectedCategory('Wszystkie')}} className="text-[#4E61F6] font-bold mt-2 hover:underline">Wyczyść filtry</button>
                        </div>
                    )}
                </div>
            </div>
    )
}