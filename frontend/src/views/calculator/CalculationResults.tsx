import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

import type {ICalculationResultsProps} from "../../types/pricing.types.ts";

export default function CalculationResults({ estimatedPrice, packageType, age, recommendedPlan }: ICalculationResultsProps) {
    return (
        <section className="py-16 px-4 bg-slate-50" id="results">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Twój wynik</h2>
                    <p className="text-lg text-gray-600">
                        Na podstawie Twoich danych ({age} lat, pakiet {packageType === 'individual' ? 'indywidualny' : packageType === 'family' ? 'rodzinny' : 'dla firmy'}) przygotowaliśmy estymację.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 flex flex-col justify-center items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <h3 className="text-xl font-semibold text-gray-500 mb-2">Szacowana składka miesięczna</h3>
                        <div className="text-6xl font-bold text-[#4E61F6] my-4">
                            {estimatedPrice} zł
                        </div>
                        <p className="text-sm text-gray-400 mb-6">*Cena jest orientacyjna i zależy od wybranego wariantu.</p>
                        <Link to="/kontakt">
                            <Button variant="outline" className="!border-blue-200 !text-blue-600 hover:!bg-blue-50">
                                Skonsultuj z doradcą
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-gradient-to-br from-[#3B4EDC] to-[#6A7BFF] p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between">
                        <div>
                            <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                                Rekomendacja
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Najlepszy wybór dla Ciebie</h3>
                            {recommendedPlan ? (
                                <>
                                    <p className="text-blue-100 mb-6 text-lg">
                                        Biorąc pod uwagę Twój wiek, polecamy <strong>{recommendedPlan.name}</strong>.
                                    </p>
                                    <ul className="space-y-2 mb-8">
                                        {recommendedPlan.features.slice(0, 3).map((f, i) => (
                                            <li key={i} className="flex items-center text-sm text-blue-50">
                                                <span className="mr-2">✓</span> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p className="text-blue-100 mb-6">Szukamy najlepszej oferty...</p>
                            )}
                        </div>
                        <Link to="/">
                            <Button variant="secondary" className="w-full">
                                Zobacz szczegóły pakietu
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}