import {useState} from "react"
import UserIcon from "../../components/icons/UserIcon.tsx"
import Button from "../../components/ui/Button.tsx"
import BuildingIcon from "../../components/icons/BuildingIcon.tsx"
import UserGroupIcon from "../../components/icons/UserGroupIcon.tsx"
import CheckCircleIcon from "../../components/icons/CheckCircleIcon.tsx"


export default function HeroSectionCalculator() {
    const [packageType, setPackageType] = useState('individual');

    return (
            <section className="relative py-8 md:py-32 px-4 bg-gradient-to-bl from-blue-600 to-indigo-800 text-white overflow-hidden">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center z-10 relative">

                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Oblicz składkę w 30 sekund</h1>
                        <p className="text-lg md:text-xl text-blue-200 mb-8 max-w-lg">
                            Wpisz podstawowe dane i poznaj szacunkową cenę swojego pakietu medycznego.
                        </p>
                        <ul className="space-y-3 text-left inline-block">
                            <li className="flex items-center text-blue-100 text-lg">
                                <CheckCircleIcon className="w-5 h-5 mr-3 text-green-300 flex-shrink-0" />
                                Porównaj oferty 20 ubezpieczycieli
                            </li>
                            <li className="flex items-center text-blue-100 text-lg">
                                <CheckCircleIcon className="w-5 h-5 mr-3 text-green-300 flex-shrink-0" />
                                Zero ukrytych kosztów i opłat
                            </li>
                            <li className="flex items-center text-blue-100 text-lg">
                                <CheckCircleIcon className="w-5 h-5 mr-3 text-green-300 flex-shrink-0" />
                                Wsparcie doradcy na każdym etapie
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white text-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl">
                        <h3 className="text-3xl font-bold text-center mb-8">Szybki kalkulator</h3>
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rodzaj pakietu</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPackageType('individual')}
                                        className={`p-4 border rounded-lg flex flex-col items-center transition-all duration-200 ${packageType === 'individual' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
                                    >
                                        <UserIcon className="w-7 h-7 text-blue-600 mb-2" />
                                        <span className="text-sm font-medium">Indywidualny</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPackageType('family')}
                                        className={`p-4 border rounded-lg flex flex-col items-center transition-all duration-200 ${packageType === 'family' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
                                    >
                                        <UserGroupIcon className="w-7 h-7 text-blue-600 mb-2" />
                                        <span className="text-sm font-medium">Rodzinny</span>
                                    </button>
                                    <button type="button" onClick={() => setPackageType('company')} className={`p-4 border rounded-lg flex flex-col items-center transition-all duration-200 ${packageType === 'company' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}>
                                        <BuildingIcon className="w-7 h-7 text-blue-600 mb-2" />
                                        <span className="text-sm font-medium">Dla Firmy</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Twój wiek</label>
                                <input type="number" id="age" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <Button variant="primary" type="submit"
                                className="w-full text-white">
                                Zobacz oferty
                            </Button>
                            <p className="text-center text-sm text-gray-600">Składki już od <strong className="text-blue-600">x zł</strong> / miesiąc</p>
                        </form>
                    </div>
                </div>
            </section>
    )
}