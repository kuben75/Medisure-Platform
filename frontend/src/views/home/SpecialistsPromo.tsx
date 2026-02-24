import {Link, useNavigate} from 'react-router-dom';
import Button from '../../components/ui/Button.tsx';
import CheckIcon from "../../components/icons/CheckIcon.tsx";
import {PROMO_SPECIALISTS} from "../../constants/specialists.tsx";
import StethoscopeIcon from "../../components/icons/StethoscopeIcon.tsx";
import DoctorIcon from "../../components/icons/DoctorIcon.tsx";

export default function SpecialistsPromo() {
    const navigate = useNavigate();

    const handleCardClick = (term: string) => {
        navigate('/specjalisci', {state: {filterByName: term}});
    };

    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">

                <div className="md:w-1/2 text-center md:text-left">
                    <span className="text-[#4E61F6] font-bold tracking-wider uppercase text-sm mb-2 block">
                        Profesjonalna Opieka
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                        Dostęp do ponad <span className="text-[#4E61F6]">30 specjalizacji</span> bez skierowania
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        Wybierając pakiet medyczny, zyskujesz pewność, że Twoim zdrowiem zajmą się najlepsi eksperci.
                        Od internisty i pediatry, przez kardiologa, aż po rzadkie specjalizacje, takie jak neurochirurg
                        czy onkolog.
                    </p>

                    <ul className="space-y-3 mb-8 text-left inline-block">
                        <li className="flex items-center gap-3 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-green-500"/> <span>Brak kolejek i limitów wizyt</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-green-500"/> <span>Doświadczona kadra medyczna</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-green-500"/> <span>Dostępność w całej Polsce</span>
                        </li>
                    </ul>

                    <Link to="/specjalisci">
                        <Button variant="primary" className="!px-8 !py-3 shadow-lg hover:shadow-xl transition-all">
                            Sprawdź listę specjalistów
                        </Button>
                    </Link>
                </div>

                <div className="md:w-1/2 relative">
                    <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-3xl transform scale-75"></div>

                    <div
                        className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm mx-auto">
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                            <div className="bg-blue-50 p-3 rounded-xl">
                                <DoctorIcon className="w-12 h-12 text-[#4E61F6]"/>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-lg">Baza Specjalistów</h4>
                                <p className="text-xs text-gray-500">Zweryfikowani lekarze</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {PROMO_SPECIALISTS.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleCardClick(item.searchTerm)}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:scale-[1.02] transition-all cursor-pointer group border border-transparent hover:border-blue-100"
                                >
                                    <span
                                        className="font-medium text-gray-700 group-hover:text-blue-700">{item.label}</span>
                                    <span
                                        className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-500 group-hover:border-blue-200 group-hover:text-blue-600">Dostępny</span>
                                </div>
                            ))}
                            <div className="text-center pt-2 text-sm text-gray-400">
                                + 28 innych specjalizacji
                            </div>
                        </div>

                        <div
                            className="absolute -bottom-6 -right-6 bg-[#4E61F6] text-white p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-bounce-slow pointer-events-none">
                            <StethoscopeIcon className="w-6 h-6 text-white"/>
                            <div>
                                <p className="text-xs font-bold opacity-80 uppercase">Wizyty</p>
                                <p className="font-bold">od ręki</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}