import React, { useState } from "react";
import UserIcon from "../../components/icons/UserIcon";
import Button from "../../components/ui/Button";
import BuildingIcon from "../../components/icons/BuildingIcon";
import UserGroupIcon from "../../components/icons/UserGroupIcon";
import CheckCircleIcon from "../../components/icons/CheckCircleIcon";

interface HeroCalcProps {
    onCalculate: (data: { type: string; age: number }) => void;
    isCalculating: boolean;
}

export default function HeroSectionCalculator({ onCalculate, isCalculating }: HeroCalcProps) {
    const [packageType, setPackageType] = useState('individual');
    const [age, setAge] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!age) return;
        onCalculate({ type: packageType, age: parseInt(age) });
    };

    return (
        <section className="relative py-20 md:py-32 px-4 bg-gradient-to-bl from-blue-600 to-indigo-800 text-white overflow-hidden">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center z-10 relative">

                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Oblicz składkę w 30 sekund</h1>
                    <p className="text-lg md:text-xl text-blue-200 mb-8 max-w-lg">
                        Wpisz podstawowe dane i poznaj szacunkową cenę swojego pakietu medycznego. Bez zobowiązań.
                    </p>
                    <ul className="space-y-4 text-left inline-block">
                        <li className="flex items-center text-blue-100 text-lg">
                            <CheckCircleIcon className="w-6 h-6 mr-3 text-green-300 flex-shrink-0" />
                            Algorytm dopasowania ofert
                        </li>
                        <li className="flex items-center text-blue-100 text-lg">
                            <CheckCircleIcon className="w-6 h-6 mr-3 text-green-300 flex-shrink-0" />
                            Natychmiastowy wynik online
                        </li>
                        <li className="flex items-center text-blue-100 text-lg">
                            <CheckCircleIcon className="w-6 h-6 mr-3 text-green-300 flex-shrink-0" />
                            Analiza opłacalności
                        </li>
                    </ul>
                </div>

                <div className="bg-white text-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl">
                    <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">Szybki kalkulator</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Wybierz rodzaj pakietu</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPackageType('individual')}
                                    className={`p-4 border rounded-xl flex flex-col items-center transition-all duration-200 ${packageType === 'individual' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                                >
                                    <UserIcon className={`w-8 h-8 mb-2 ${packageType === 'individual' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-bold ${packageType === 'individual' ? 'text-blue-700' : 'text-gray-500'}`}>Indywidualny</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPackageType('family')}
                                    className={`p-4 border rounded-xl flex flex-col items-center transition-all duration-200 ${packageType === 'family' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                                >
                                    <UserGroupIcon className={`w-8 h-8 mb-2 ${packageType === 'family' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-bold ${packageType === 'family' ? 'text-blue-700' : 'text-gray-500'}`}>Rodzinny</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPackageType('company')}
                                    className={`p-4 border rounded-xl flex flex-col items-center transition-all duration-200 ${packageType === 'company' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                                >
                                    <BuildingIcon className={`w-8 h-8 mb-2 ${packageType === 'company' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-bold ${packageType === 'company' ? 'text-blue-700' : 'text-gray-500'}`}>Dla Firmy</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2"> Twój wiek (lat)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="age"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    required
                                    min={18}
                                    max={100}
                                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    placeholder="np. 30"
                                />
                                <span className="absolute right-4 top-4 text-gray-400">lat</span>
                            </div>
                        </div>

                        <Button variant="primary" type="submit" className="w-full py-4 text-lg shadow-blue-500/30" disabled={isCalculating}>
                            {isCalculating ? "Obliczanie..." : "Oblicz składkę"}
                        </Button>

                        <p className="text-center text-xs text-gray-500 mt-4">
                            Klikając przycisk akceptujesz naszą politykę prywatności.
                        </p>
                    </form>
                </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[60%] bg-indigo-500/20 rounded-full blur-3xl"></div>
            </div>
        </section>
    );
}