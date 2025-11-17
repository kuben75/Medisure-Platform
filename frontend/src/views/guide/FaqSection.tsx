import Accordion from "../../components/ui/Accordion.tsx";

interface IFaqItem {
    q: string;
    a: string;
}
export default function FaqSection() {
    const faqs: IFaqItem[] = [
        { q: "Czym różni się ubezpieczenie medyczne od zdrowotnego NFZ?",
            a: "Nasze ubezpiecznie zapewnia szybki dostęp do prywatnych lekarzy i badań, bez kolejek, co stanowi główną różnicę w stosunku do publicznej służby zdrowia NFZ." },
        { q: "Czy muszę mieć badania, żeby zawrzeć umowę?",
            a: "Nie, w większości przypadków nie wymagamy wstępnych badań lekarskich. Umowę można zawrzeć na podstawie wypełnionej ankiety medycznej." },
        { q: "Kto może wykupić ubezpieczenie w Medisure?",
            a: "Każda osoba powyżej 18. roku życia, również rodziny i firmy. Oferujemy pakiety indywidualne, rodzinne oraz dla małych i dużych przedsiębiorstw." },
    ]
    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-lg md:max-w-3xl mx-auto">
                <h2 className="h2-primary">FAQ - Najczęściej zadawane pytania</h2>
                <div>
                    {faqs.map((f, i) => (
                        <Accordion key={i} question={f.q} answer={f.a} />
                    ))}
                </div>
            </div>
        </section>
    )
}