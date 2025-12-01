import { useEffect } from 'react';
import Navbar from '../components/layout/Navbar.tsx';
import Accordion from '../components/ui/Accordion.tsx';
import { FAQ_DATA } from "../constants/faq.ts";

export default function FaqPage() {

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 py-12 md:py-24 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-[#4E61F6] font-bold tracking-wider uppercase text-sm bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                            Baza wiedzy
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-6 mb-4">
                            Centrum Pomocy
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Kompletna lista odpowiedzi na pytania dotyczące pakietów, płatności i działania serwisu.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-2">
                        {FAQ_DATA.map((f, i) => (
                            <Accordion key={i} question={f.q} answer={f.a} />
                        ))}
                    </div>

                    <div className="mt-12 text-center bg-blue-600 text-white p-8 rounded-2xl shadow-lg">
                        <h3 className="text-2xl font-bold mb-2">Nie znalazłeś odpowiedzi?</h3>
                        <p className="mb-6 opacity-90">Nasi konsultanci są dostępni, aby pomóc Ci w wyborze.</p>
                        <a href="/kontakt" className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors">
                            Skontaktuj się z nami
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}