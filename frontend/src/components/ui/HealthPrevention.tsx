

const HeartPulseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

export default function HealthPrevention({ birthDate }: { birthDate?: string }) {
    if (!birthDate) return null;

    const calculatePatientAge = (dateString: string) => {
        const birth = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const age = calculatePatientAge(birthDate);

    let recommendations = [];
    let title = "";

   if (age >= 18 && age < 30) {
        title = "Dbaj o siebie (20-30 lat)";
        recommendations = [
            "Morfologia krwi, glukoza i badanie ogólne moczu raz w roku.",
            "Pomiar ciśnienia tętniczego przy każdej wizycie.",
            "Kontrola dentystyczna co pół roku."
        ];
    } else if (age >= 30 && age < 40) {
        title = "Profilaktyka 30+";
        recommendations = [
            "Lipidogram (cholesterol) co 3-5 lat.",
            "USG jamy brzusznej co 3 lata.",
            "Regularne badanie wzroku.",
            "Kobiety: Cytologia i USG piersi."
        ];
    } else if (age >= 40 && age < 50) {
        title = "Zdrowie po 40-stce";
        recommendations = [
            "EKG spoczynkowe raz na 3 lata.",
            "Badanie poziomu cukru we krwi raz w roku.",
            "Kontrola wagi i BMI.",
            "Mężczyźni: Badanie prostaty."
        ];
    } else if (age >= 50 && age < 60) {
        title = "Złoty wiek (50+)";
        recommendations = [
            "Kolonoskopia (raz na 10 lat).",
            "Badanie gęstości kości (densytometria).",
            "Regularne EKG i wizyta kardiologiczna.",
            "Badanie słuchu."
        ]
    }
    else {
        title = "Profilaktyka 60+";
        recommendations = [
            "Badania okulistyczne (jaskra, zaćma) co roku.",
            "Szczepienia przeciw grypie i pneumokokom.",
            "Regularne badania funkcji nerek i wątroby.",
            "Konsultacje geriatryczne."
        ]
    }

    return (
        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-xl border border-red-100 mt-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-200 rounded-full blur-2xl opacity-20 -mr-5 -mt-5"></div>

            <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <HeartPulseIcon />
                </div>
                <h4 className="font-bold text-red-800 text-sm uppercase tracking-wide">Twoja ścieżka zdrowia</h4>
            </div>

            <h5 className="font-bold text-gray-800 mb-2">{title}</h5>

            <ul className="space-y-2 text-sm text-gray-600 relative z-10">
                {recommendations.map((rec, idx) => (
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
    );
}