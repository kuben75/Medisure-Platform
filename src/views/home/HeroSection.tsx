import {pricingPlans} from "../../tests/MockData.ts";
import Button from "../../components/ui/Button.tsx";
export default function HeroSection() {
    return (
        <section className="relative w-full text-center text-white py-20 md:pb-32 px-4 bg-gradient-to-br from-[#3B4EDC] to-[#6A7BFF]">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl text-white md:text-5xl font-bold mb-4">Porównywarka Pakietów Medycznych</h1>
                <p className="text-lg md:text-xl text-blue-100 max-2-3x1 mx-auto mb-12">Zestaw oferty czołowych usługodawców w Polsce i wybierz pakiet
                    medyczny dopasowany do swoich potrzeb – szybko i wygodnie.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {pricingPlans.map((e, i) => (
                    <div key={i} className="bg-[#EDEFFE] backdrop-blur-lg rounded-xl p-6 text-center shadow-lg border border-white/20 flex flex-col">
                        <h3 className="text-xl text-gray-800 font-semibold mb-2">{e.name}</h3>
                        <p className="text-3xl text-gray-800 font-bold mb-1">{e.price}<span className="text-base font-normal"> / miesiąc</span> </p>
                        <ul className="space-y-2 my-6 text-gray-800 flex-grow">
                            {e.features.map((f, i)=> (
                                <li key={i} className="flex items-center justify-center"><span>{f}</span></li>
                            ))}
                        </ul>
                        <div className="mt-auto mb-2">
                            <span className="text-yellow-500 font-bold mr-2">⭐ {e.averageRating}</span>
                            <span className="text-sm text-gray-600 font-semibold">{e.reviews}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 flex-grow">{e.description}</p>
                        <Button variant="primary" className="w-full">Zobacz szczegóły</Button>
                    </div>
                ))}
            </div>
            <div className="mt-12">
                <Button variant="secondary">
                    Kliknij, aby zobaczyć więcej pakietów
                </Button>
            </div>
        </section>
    )
}