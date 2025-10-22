import BuildingIcon from "../../components/icons/BuildingIcon.tsx";
import PercentIcon from "../../components/icons/PercentIcon.tsx";
import ClockIconGuide from "../../components/icons/ClockIconGuide.tsx";
import FileTextIcon from "../../components/icons/FileTextIcon.tsx";

export default function WhatToLookFor() {
    const items = [
        { icon: <BuildingIcon />, title: "Liczba dostępnych placówek" },
        { icon: <ClockIconGuide />, title: "Czas oczekiwania na wizytę" },
        { icon: <PercentIcon />, title: "Cena, koszty dodatkowe" },
        { icon: <FileTextIcon />, title: "Warunki umowy i rezygnacji" },
    ]
    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="h2-primary">Na co zwrócić uwagę przy wyborze pakietów?</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mt-18">
                    {items.map((e, i) => (
                        <div key={i} className="flex flex-col items-center text-center justify-center p-10 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="text-blue-600 mb-6">{e.icon}</div>
                            <div className="font-semibold text-gray-800">{e.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}