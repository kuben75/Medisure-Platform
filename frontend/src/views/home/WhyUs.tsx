import StethoscopeIcon from "../../components/icons/StethoscopeIcon.tsx"
import PillIcon from "../../components/icons/PillIcon.tsx"
import FilePlusIcon from "../../components/icons/FilePlusIcon.tsx"
import UsersIcon from "../../components/icons/UsersIcon.tsx"
import ClockIcon from "../../components/icons/ClockIcon.tsx"
import ShieldIcon from "../../components/icons/ShieldIcon.tsx";

const whyUsItems = [
    { icon: <StethoscopeIcon />, title: "Pewność i ochrona zdrowia" },
    { icon: <PillIcon />, title: "Nowoczesne podejście do opieki zdrowotnej" },
    { icon: <FilePlusIcon />, title: "Elastyczna oferta dopasowana do ciebie" },
    { icon: <UsersIcon />, title: "Zaufanie tysięcy klientów" },
    { icon: <ClockIcon />, title: "Całodobowe wsparcie" },
    {icon: <ShieldIcon className="w-6 h-6"/>, title: "Bezpieczeństwo danych i prywatność" }
]

export default function WhyUs() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="h2-primary">Dlaczego MY?</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                     {whyUsItems.map((e, i) => (
                         <div key={i} className="bg-white p-8 rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                             <div className="text-[#4E61F6] mb-4">{e.icon}</div>
                             <h3 className="text-lg font-semibold text-gray-800">{e.title}</h3>
                         </div>
                     ))}
                </div>
            </div>
        </section>
    )
}