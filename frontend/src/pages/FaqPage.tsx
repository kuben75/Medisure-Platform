import {useEffect, useState} from 'react';
import Navbar from '../components/layout/Navbar.tsx';
import Accordion from '../components/ui/Accordion.tsx';
import {FAQ_DATA} from "../constants/faq.ts";

export default function FaqPage() {
    const [openIndexes, setOpenIndexes] = useState<number[]>([]);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleToggle = (index: number) => {
        if (openIndexes.includes(index)) {
            setOpenIndexes(p => p.filter(i => i !== index));
        }
        else {
            setOpenIndexes(p => [...p, index]);
        }
    };
    const handleCollapseAll = () => {
        setOpenIndexes([]);
    };
    return (
        <>
            <Navbar/>
            <div className="min-h-screen bg-slate-50 py-12 md:py-24 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <span
                            className="text-[#4E61F6] font-bold tracking-wider uppercase text-sm bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                            Baza wiedzy
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-6 mb-4">
                            Centrum Pomocy
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Kompletna lista odpowiedzi na pytania dotyczące pakietów, płatności i działania serwisu.
                        </p>
                    </div>
                    {openIndexes.length > 0 && (
                        <div className="flex justify-end mb-4">
                            <button onClick={handleCollapseAll}
                                    className="text-sm text-gray-500 hover:text-[#4E61F6] font-medium flex items-center gap-1 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25"/>
                                </svg>
                                Zwiń wszystkie
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-2">
                        {FAQ_DATA.map((f, i) => (
                            <Accordion key={i} question={f.q} answer={f.a} isOpen={openIndexes.includes(i)}
                                       onToggle={() => handleToggle(i)}/>
                        ))}
                    </div>

                    <div className="mt-12 text-center bg-blue-600 text-white p-8 rounded-2xl shadow-lg">
                        <h3 className="text-2xl font-bold mb-2">Nie znalazłeś odpowiedzi?</h3>
                        <p className="mb-6 opacity-90">Nasi konsultanci są dostępni, aby pomóc Ci w wyborze.</p>
                        <a href="/kontakt"
                           className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors">
                            Skontaktuj się z nami
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}