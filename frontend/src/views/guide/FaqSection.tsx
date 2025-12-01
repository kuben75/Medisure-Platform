import Accordion from "../../components/ui/Accordion.tsx";
import {FAQ_DATA} from "../../constants/faq.ts";
import {Link} from "react-router-dom";
import Button from "../../components/ui/Button.tsx";

export default function FaqSection() {

    const featuredFaqs = FAQ_DATA.slice(0, 4);

    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-lg md:max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">FAQ - Najczęściej zadawane pytania</h2>
                    <p className="text-gray-500">Znajdź szybkie odpowiedzi na kluczowe pytania.</p>
                </div>

                <div className="mb-8">
                    {featuredFaqs.map((f, i) => (
                        <Accordion key={i} question={f.q} answer={f.a} />
                    ))}
                </div>

                <div className="text-center">
                    <Link to="/faq">
                        <Button variant="secondary" className="!px-8 !py-3 border-gray-300 text-gray-600 hover:border-[#4E61F6] hover:text-[#4E61F6]">
                            Zobacz wszystkie pytania ({FAQ_DATA.length})
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}