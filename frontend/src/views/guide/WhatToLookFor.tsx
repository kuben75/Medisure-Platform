import BuildingIcon from "../../components/icons/BuildingIcon.tsx";
import PercentIcon from "../../components/icons/PercentIcon.tsx";
import ClockIconGuide from "../../components/icons/ClockIconGuide.tsx";
import FileTextIcon from "../../components/icons/FileTextIcon.tsx";

export default function WhatToLookFor() {
    const items = [
        {icon: <BuildingIcon/>, title: "Liczba dostępnych placówek", desc: "Sprawdź zasięg terytorialny."},
        {icon: <ClockIconGuide/>, title: "Czas oczekiwania na wizytę", desc: "Gwarantowane terminy (np. 24h)."},
        {icon: <PercentIcon/>, title: "Cena i koszty dodatkowe", desc: "Czy są dopłaty za wizyty domowe?"},
        {icon: <FileTextIcon/>, title: "Warunki umowy i rezygnacji", desc: "Okres wypowiedzenia i kary."},
    ];

    return (
        <section className="py-16 md:py-24 px-4 bg-white">
            <div className="max-w-7xl mx-auto text-center">

                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
                    Na co zwrócić uwagę?
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto mb-12 md:mb-16">
                    Wybór pakietu to decyzja na lata. Zanim podpiszesz umowę, sprawdź te 4 kluczowe aspekty.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {items.map((e, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center text-center justify-start p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full"
                        >
                            <div
                                className="w-16 h-16 bg-blue-50 text-[#4E61F6] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#4E61F6] group-hover:text-white transition-colors duration-300 shadow-sm">
                                <div className="w-8 h-8 [&>svg]:w-full [&>svg]:h-full">
                                    {e.icon}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#4E61F6] transition-colors">
                                {e.title}
                            </h3>

                            <p className="text-sm text-gray-500 leading-relaxed">
                                {e.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}