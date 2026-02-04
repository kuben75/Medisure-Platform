import CalendarIcon from "../icons/CalendarIcon.tsx"
import GroupIcon from "../icons/GroupIcon.tsx";
import ListIcon from "../icons/ListIcon.tsx";

export default function PriceFactorsSection() {
    return (
        <section className="py-20 px-4 bg-slate-50 border-t border-gray-200">
            <div className="container mx-auto text-center max-w-5xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">
                    Co ma wpływ na cenę pakietu medycznego?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center">
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
                            <CalendarIcon className="w-8 h-8"/>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Czas umowy</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Dłuższe zobowiązanie (24 miesiące) pozwala nam zaoferować atrakcyjniejsze rabaty.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center">
                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-600">
                            <GroupIcon/>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Liczba osób</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Pakiety rodzinne i firmowe są znacznie bardziej opłacalne w przeliczeniu na jedną osobę.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center">
                        <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-4 text-purple-600">
                            <ListIcon/>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Zakres pakietów</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Dostęp do zaawansowanej diagnostyki, stomatologii czy rehabilitacji wpływa na ostateczną składkę.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}