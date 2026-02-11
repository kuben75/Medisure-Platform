import {useMemo} from 'react';
import {calculateAge} from "../../utils/dateHelpers.ts";
import {PREVENTION_GUIDELINES} from "../../constants/health.ts";
import HeartPulseIcon from "../icons/HeartPulseIcon.tsx";


export default function HealthPrevention({birthDate}: { birthDate?: string }) {

    const age = calculateAge(birthDate);

    const guideline = useMemo(() => {
        if (!birthDate) {
            return null;
        }
        return PREVENTION_GUIDELINES.find(g => age >= g.minAge);
    }, [age, birthDate]);

    if (!birthDate || !guideline) {
        return null;
    }

    return (
        <div
            className="bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-xl border border-red-100 mt-6 relative overflow-hidden">
            <div
                className="absolute top-0 right-0 w-20 h-20 bg-red-200 rounded-full blur-2xl opacity-20 -mr-5 -mt-5"></div>

            <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <HeartPulseIcon/>
                </div>
                <h4 className="font-bold text-red-800 text-sm uppercase tracking-wide">Twoja ścieżka zdrowia</h4>
            </div>

            <h5 className="font-bold text-gray-800 mb-2">{guideline.title}</h5>

            <ul className="space-y-2 text-sm text-gray-600 relative z-10">
                {guideline.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        {rec}
                    </li>
                ))}
            </ul>

            <p className="text-[10px] text-gray-400 mt-4 italic">
                *Pamiętaj, to tylko sugestie. Skonsultuj się z lekarzem.
            </p>
        </div>
    )
}