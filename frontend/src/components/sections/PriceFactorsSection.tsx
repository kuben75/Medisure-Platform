import CalendarIcon from "../icons/CalendarIcon.tsx"

const GroupIcon = () => (
    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.502.152a3 3 0 01-4.682-2.72M10.5 18.72a9.094 9.094 0 013.741-.479M6.75 12.75a3 3 0 11-6 0 3 3 0 016 0zM17.25 12.75a3 3 0 11-6 0 3 3 0 016 0zM10.5 6a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)

const ListIcon = () => (
    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

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