
export default function HelpSection() {
    return (
        <>
        <section className="relative bg-gradient-to-r from-blue-600 to-indigo-800 text-white overflow-hidden">
            <div className="container mx-auto px-4 md:py-32 flex flex-col md:flex-row items-center relative z-10">
                <div className="md:w-1/2 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">Nasi doradcy klienta
                        odpowiedzą na
                        każde Twoje pytanie</h1>
                    <a href="#"
                       className="bg-white text-blue-700 font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105 inline-block">
                        Dane kontaktowe
                    </a>
                </div>
                <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                    <img src="src/assets/doradca.svg" alt="Doradca klienta"
                         className="w-300 h-128 md:w-96 object-cover rounded-xl"/>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-32">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M1440 120H0V26.2953C240 5.43167 480 -5.43167 720 5.43167C960 16.295 1200 48.8844 1440 103.064V120Z"
                        fill="white"/>
                </svg>
            </div>
        </section>
        <section id="contact-form" className="py-25 px-4 bg-white">
            <div className="container mx-auto">
                <h2 className="h2-primary text-center">Formularz kontaktowy</h2>
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 bg-slate-50 p-8 md:p-12 rounded-2xl shadow-lg border">
                    <div>
                        <div className="flex items-center mb-6">
                            {/*<img src="" />*/}
                            <span className="text-blue-600 font-bold text-lg">Nazwa Firmy</span>
                        </div>
                    </div>
                </div>
            </div>

        </section>
        </>
    )
}