import {useState, useMemo, useEffect} from 'react';
import { SPECIALISTS_LIST } from '../constants/specialists.tsx';
import type { ISpecialist } from "../types/specialists.types.ts";
import Modal from '../components/ui/modals/Modal.tsx';
import Button from '../components/ui/Button.tsx';
import CheckIcon from '../components/icons/CheckIcon.tsx';
import BriefcaseIcon from "../components/icons/BriefcaseIcon.tsx";
import {useLocation, useNavigate} from 'react-router-dom';

const CATEGORY_GROUPS: Record<string, string[]> = {
    "Podstawowa i Rodzinna": ["Podstawowa", "Pediatria", "Geriatria", "Medycyna rodzinna"],
    "Specjaliści do chorób wewnętrznych": [
        "Kardiologia", "Endokrynologia", "Diabetologia", "Gastrologia", "Nefrologia",
        "Pulmonologia", "Reumatologia", "Neurologia", "Alergologia", "Hematologia",
        "Onkologia", "Choroby zakaźne", "Choroby wewnętrzne"
    ],
    "Chirurgia i Zabiegi": [
        "Chirurgia", "Ortopedia", "Urologia", "Neurochirurgia", "Laryngologia",
        "Okulistyka", "Ginekologia", "Anestezjologia"
    ],
    "Zdrowie Psychiczne": ["Psychologia", "Psychiatria"],
    "Rozwój Dziecka": ["Pediatria", "Logopedia"],
    "Inne": [
        "Stomatologia", "Dermatologia", "Dietetyka", "Rehabilitacja",
        "Diagnostyka", "Medycyna sportowa"
    ]
}

const CATEGORY_BUTTONS = ["Wszystkie", ...Object.keys(CATEGORY_GROUPS)]

const VerifiedBadge = () => (
    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] border-2 border-white absolute bottom-0 right-0 shadow-sm" title="Zweryfikowany specjalista Medisure">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    </div>
)

export default function SpecialistsPage() {
    const navigate = useNavigate()
    const location = useLocation();
    const packageFilterName = location.state?.filterByPackage || null;
    const initialSearch = location.state?.filterByName || "";
    const [searchTerm, setSearchTerm] = useState(initialSearch)
    const [selectedCategory, setSelectedCategory] = useState("Wszystkie");
    const [selectedSpecialist, setSelectedSpecialist] = useState<ISpecialist | null>(null)

    useEffect(() => {
        if (!packageFilterName && !initialSearch) window.scrollTo(0, 0)
        if (initialSearch) setSearchTerm(initialSearch);
    }, [packageFilterName, initialSearch])

    const filtered = useMemo(() => {
        return SPECIALISTS_LIST.filter(s => {
            const matchesSearch =
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.title.toLowerCase().includes(searchTerm.toLowerCase())

            let matchesCategory = false

            if (selectedCategory === "Wszystkie") {
                matchesCategory = true
            } else {
                const allowedCategories = CATEGORY_GROUPS[selectedCategory]
                if (allowedCategories && allowedCategories.includes(s.category))
                    matchesCategory = true
            }
            return matchesSearch && matchesCategory
        })
    }, [searchTerm, selectedCategory])

    return (
        <div className="min-h-screen bg-slate-50 py-12 md:py-24 px-4">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-16">
                    <span className="text-[#4E61F6] font-bold tracking-wider uppercase text-xs bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                        Nasza kadra medyczna
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mt-6 mb-6 tracking-tight">
                        Poznaj naszych <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4E61F6] to-purple-600">Specjalistów</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Współpracujemy tylko z najlepszymi lekarzami. Sprawdź ich doświadczenie i zobacz, w których pakietach są dostępni.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-8 mb-16">
                    <div className="relative w-full max-w-xl group">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl border border-gray-200 shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-lg pl-14 bg-white transition-all group-hover:shadow-md"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 absolute left-5 top-4.5 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
                        {CATEGORY_BUTTONS.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                    selectedCategory === cat
                                        ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                                }`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filtered.map((spec) => (
                        <div
                            key={spec.id}
                            onClick={() => setSelectedSpecialist(spec)}
                            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50 to-white"></div>

                            <div className="relative mb-4 mt-2">
                                <div className="w-28 h-28 rounded-full p-1 bg-white border-2 border-gray-100 shadow-md group-hover:border-blue-400 transition-colors">
                                    <img
                                        src={spec.imageUrl}
                                        alt={spec.name}
                                        className="w-full h-full rounded-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <VerifiedBadge />
                            </div>

                            <div className="relative z-10 w-full">
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 block">{spec.category}</span>
                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate px-2">{spec.title} {spec.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{spec.experienceYears} lat doświadczenia</p>

                                <div className="text-xs text-gray-500 line-clamp-2 mb-6 h-8 px-2">
                                    {spec.description}
                                </div>

                                <Button variant="secondary" className="w-full text-sm !py-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-200">
                                    Zobacz profil
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 animate-fade-in-up">
                        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 text-4xl shadow-inner">🤷‍♂️</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Nie znaleziono specjalisty</h3>
                        <p className="text-gray-500 mb-6">W tej kategorii nie ma lekarzy pasujących do Twojego wyszukiwania.</p>
                        <button
                            onClick={() => {setSearchTerm(''); setSelectedCategory('Wszystkie')}}
                            className="text-[#4E61F6] font-bold hover:underline px-6 py-2 bg-blue-50 rounded-lg"
                        >
                            Wyczyść wszystkie filtry
                        </button>
                    </div>
                )}

                <Modal
                    isOpen={!!selectedSpecialist}
                    onClose={() => setSelectedSpecialist(null)}
                    className="max-w-2xl"
                >
                    {selectedSpecialist && (
                        <div>
                            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-8 border-b border-gray-100">
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={selectedSpecialist.imageUrl}
                                        alt={selectedSpecialist.name}
                                        className="w-32 h-32 rounded-2xl object-cover shadow-lg border-4 border-white"
                                    />
                                    <div className="absolute -bottom-3 -right-3 bg-white p-1.5 rounded-full shadow-md">
                                        <div className="bg-green-100 text-green-700 p-1 rounded-full">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-2">{selectedSpecialist.category}</span>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-1">{selectedSpecialist.title} {selectedSpecialist.name}</h2>
                                    <p className="text-gray-500 font-medium mb-4">{selectedSpecialist.experienceYears} lat praktyki lekarskiej</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {selectedSpecialist.description}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <BriefcaseIcon className="w-5 h-5 text-gray-400"/>
                                    Dostępny w pakietach:
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {selectedSpecialist.availableInPackages.map((pkg, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                                            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-800">{pkg}</span>
                                            <button
                                                onClick={() => {
                                                    navigate('/kalkulator');
                                                }}
                                                className="text-xs font-bold text-[#4E61F6] opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Sprawdź →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                <Button variant="secondary" onClick={() => setSelectedSpecialist(null)}>
                                    Zamknij
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>

            </div>
        </div>
    )
}