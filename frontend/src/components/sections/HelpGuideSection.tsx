import {Link} from "react-router-dom";

export default function HelpGuideSection() {
    return (
        <section className="bg-white py-12">
            <div className="max-w-5xl mx-auto px-4 text-center">
                <h2 className="h2-primary">Potrzebujesz Pomocy?</h2>
                <div className="text-center my-8">
                    <div className="text-gray-700 text-xl md:text-2xl font-medium">
                        Skorzystaj z naszego <Link className="text-blue-600 hover:underline hover:cursor-pointer"
                                                   to="/kontakt">formularza kontaktowego</Link> lub z innych sposobów
                        kontaktu do nas a napewno ci pomozemy!
                    </div>
                </div>
            </div>
        </section>
    );
}