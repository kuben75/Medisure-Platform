import {whyUsItems} from "../../constants/specialists.tsx";

export default function WhyUs() {
    return (
        <section className="py-20 md:py-28 px-4 bg-slate-50">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Dlaczego warto wybrać <span className="text-[#4E61F6]">Medisure</span>?
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        Nie jesteśmy zwykłą porównywarką. Jesteśmy Twoim partnerem w dbaniu o zdrowie.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {whyUsItems.map((item, i) => (
                        <div
                            key={i}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:cursor-pointer group"
                        >
                            <div
                                className="w-14 h-14 bg-[#eff1ff] rounded-xl flex items-center justify-center text-[#4E61F6] mb-6 group-hover:bg-[#4E61F6] group-hover:text-white transition-colors duration-300">
                                <div className="w-8 h-8 [&>svg]:w-full [&>svg]:h-full">
                                    {item.icon}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#4E61F6] transition-colors">
                                {item.title}
                            </h3>

                            <p className="text-gray-500 leading-relaxed text-sm">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}