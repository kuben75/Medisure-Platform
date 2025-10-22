import React from "react";
import ChevronRightIcon from "../../components/icons/chevronRightIcon.tsx";


export default function GuideHero() {
    const steps = [
        { number: 1, text: "Wybierz swoje potrzeby zdrowotne" },
        { number: 2, text: "Wybierz zakres usług, cenę, firmę i czas trwania pakietu." },
        { number: 3, text: "Zobacz, czym różnią się pakiety i wybierz najlepszy dla siebie." },
        { number: 4, text: "Zamów pakiet online lub skontaktuj się z nami." },
    ]
    return (
        <section
            className="text-white w-full min-h-72 py-25 md:pb-32 px-4 bg-gradient-to-br from-[#3B4EDC] to-[#6A7BFF]">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Przewodnik Pacjenta</h1>
                <p className="text-lg md:text-xl text-blue-100">Dowiedz się, jak wybrać najlepszy pakiet medyczny dla
                    siebie.<br/> Przewodnik krok po kroku dla każdego pacjenta.</p>
            </div>
            <div className="max-w-6xl mx-auto mt-20 md:mt-35">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Jak działa porównywarka?</h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-y-8 md:gap-x-5">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <div
                                className="flex-1 bg-white/90 text-gray-800 p-10 rounded-2xl flex flex-col h-full w-80 md:w-full text-left shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                <div
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 font-bold text-2xl mb-5 flex-shrink-0">{step.number}</div>
                                <p className="text-gray-700">{step.text}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="text-blue-300 hidden md:block px-2"><ChevronRightIcon/></div>)}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    )
}