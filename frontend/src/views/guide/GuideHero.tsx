import {Fragment} from "react";
import ChevronRightIcon from "../../components/icons/ChevronRightIcon.tsx";

export default function GuideHero() {
    const steps = [
        {number: 1, title: "Zdefiniuj potrzeby", text: "Zdefiniuj swoje potrzeby zdrowotne."},
        {number: 2, title: "Wybierz parametry", text: "Wybierz zakres usług, cenę, firmę i czas trwania pakietu."},
        {number: 3, title: "Porównaj oferty", text: "Zobacz, czym różnią się pakiety i wybierz najlepszy dla siebie."},
        {number: 4, title: "Zamów online", text: "Zakup pakiet online lub skontaktuj się z nami."},
    ];

    return (
        <section
            className="relative w-full text-white py-20 md:py-32 px-4 bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#4338ca] overflow-hidden">

            <div
                className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <div
                className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">

                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight drop-shadow-md">
                        Przewodnik Pacjenta
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 leading-relaxed opacity-90">
                        Nie wiesz, jaki pakiet wybrać? Przygotowaliśmy prosty proces,
                        który pomoże Ci podjąć najlepszą decyzję w 4 krokach.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-14 text-white/90">
                        Jak działa porównywarka?
                    </h2>

                    <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-4">
                        {steps.map((step, index) => (
                            <Fragment key={step.number}>
                                <div className="flex-1 flex flex-col relative group">
                                    <div
                                        className="bg-white text-gray-800 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl border border-white/10">

                                        <div className="flex items-center justify-between mb-4">
                                            <div
                                                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-[#E4E7FE] text-[#4E61F6] font-black text-xl md:text-2xl shadow-inner">
                                                {step.number}
                                            </div>
                                            <div
                                                className="w-2 h-2 rounded-full bg-gray-200 group-hover:bg-[#4E61F6] transition-colors"></div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {step.text}
                                        </p>
                                    </div>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className="flex items-center justify-center py-2 md:py-0">
                                        <div className="hidden md:block text-blue-300 opacity-60">
                                            <ChevronRightIcon className="w-8 h-8"/>
                                        </div>

                                        <div className="md:hidden text-blue-300 opacity-60 rotate-90">
                                            <ChevronRightIcon className="w-6 h-6"/>
                                        </div>
                                    </div>
                                )}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}