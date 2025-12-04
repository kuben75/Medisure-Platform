import HeartSpecialIcon from "../components/icons/HeartSpecialIcon.tsx"
import DefaultIcon from "../components/icons/DefaultIcon.tsx"
import EyeIcon from "../components/icons/EyeIcon.tsx"
import BabyIcon from "../components/icons/BabyIcon.tsx"
import BoneIcon from "../components/icons/BoneIcon.tsx"
import BrainIcon from "../components/icons/BrainIcon.tsx";
import type {ISpecialist} from "../types/specialists.types.ts";

export const SPECIALISTS_LIST: ISpecialist[] = [
    { name: "Internista", category: "Podstawowa", icon: <DefaultIcon className="text-blue-500 w-10 h-10"/> },
    { name: "Pediatra", category: "Podstawowa", icon: <BabyIcon className="text-pink-500 w-10 h-10"/> },
    { name: "Lekarz rodzinny", category: "Podstawowa", icon: <DefaultIcon className="text-blue-500 w-10 h-10"/> },
    { name: "Lekarz medycyny pracy", category: "Podstawowa", icon: <DefaultIcon className="text-blue-500 w-10 h-10"/> },
    { name: "Pielęgniarka", category: "Podstawowa", icon: <DefaultIcon className="text-blue-500 w-10 h-10"/> },
    { name: "Okulista", category: "Specjalistyczna", icon: <EyeIcon className="text-cyan-500 w-10 h-10"/> },
    { name: "Kardiolog", category: "Specjalistyczna", icon: <HeartSpecialIcon className="text-red-500 w-10 h-10"/> },
    { name: "Dermatolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-purple-500 w-10 h-10"/> },
    { name: "Ortopeda", category: "Specjalistyczna", icon: <BoneIcon className="text-slate-500 w-10 h-10"/> },
    { name: "Ginekolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-pink-600 w-10 h-10"/> },
    { name: "Laryngolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-indigo-500 w-10 h-10"/> },
    { name: "Neurolog", category: "Specjalistyczna", icon: <BrainIcon className="text-gray-500 w-10 h-10"/> },
    { name: "Urolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-blue-600 w-10 h-10"/> },
    { name: "Gastrolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-amber-500 w-10 h-10"/> },
    { name: "Pulmonolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-teal-500 w-10 h-10"/> },
    { name: "Psychiatra", category: "Zdrowie Psychiczne", icon: <BrainIcon className="text-violet-500 w-10 h-10"/> },
    { name: "Endokrynolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-rose-400 w-10 h-10"/> },
    { name: "Reumatolog", category: "Specjalistyczna", icon: <BoneIcon className="text-stone-500 w-10 h-10"/> },
    { name: "Alergolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-lime-500 w-10 h-10"/> },
    { name: "Onkolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-orange-500 w-10 h-10"/> },
    { name: "Diabetolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-blue-400 w-10 h-10"/> },
    { name: "Chirurg ogólny", category: "Chirurgia", icon: <DefaultIcon className="text-red-700 w-10 h-10"/> },
    { name: "Chirurg naczyniowy", category: "Chirurgia", icon: <HeartSpecialIcon className="text-red-800 w-10 h-10"/> },
    { name: "Hematolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-red-400 w-10 h-10"/> },
    { name: "Nefrolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-yellow-600 w-10 h-10"/> },
    { name: "Geriatra", category: "Specjalistyczna", icon: <DefaultIcon className="text-gray-400 w-10 h-10"/> },
    { name: "Zakaźnik", category: "Specjalistyczna", icon: <DefaultIcon className="text-green-600 w-10 h-10"/> },
    { name: "Radiolog", category: "Diagnostyka", icon: <DefaultIcon className="text-slate-700 w-10 h-10"/> },
    { name: "Wenerolog", category: "Specjalistyczna", icon: <DefaultIcon className="text-pink-700 w-10 h-10"/> },
    { name: "Anestezjolog", category: "Chirurgia", icon: <DefaultIcon className="text-sky-600 w-10 h-10"/> }
]