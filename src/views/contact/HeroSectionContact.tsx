import ChevronRightIcon from "../../components/icons/ChevronRightIcon.tsx";
import Button from "../../components/ui/Button.tsx";

export default function HelpSection() {
    return (
        <section className="relative bg-gradient-to-br from-blue-600 to-indigo-800 text-white overflow-hidden">
            <div className="container mx-auto py-32 px-4 flex flex-col md:flex-row items-center relative z-10">
                <div className="md:w-1/2 text-center md:text-left">
                    <span className="text-sm font-bold uppercase tracking-widest text-blue-200">
                        Jesteśmy dla Ciebie
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold my-6 leading-tight">
                        Nasi doradcy klienta odpowiedzą na każde Twoje pytanie
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 opacity-90 mb-10 max-w-xl mx-auto md:mx-0">
                        Niezależnie od tego, czy masz problem techniczny, czy pytanie o ofertę, nasz zespół jest gotowy, aby Ci pomóc.
                    </p>
                    <Button variant="secondary"
                        className="group bg-white text-blue-700 font-bold py-4 px-8 rounded-full transition duration-300 inline-flex items-center shadow-lg hover:shadow-xl">
                        Dane kontaktowe
                        <ChevronRightIcon />
                    </Button>
                </div>

                <div className="md:w-1/2 mt-16 md:mt-0 flex justify-center md:justify-end">
                    <img
                        src="src/assets/doradca.svg"
                        alt="Doradca klienta przy biurku"
                        className="w-full max-w-lg object-cover rounded-xl"
                    />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-32" style={{ zIndex: 5 }}>
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path transform="scale(-1, 1) translate(-1440, 0)"
                        d="M1440 120H0V26.2953C240 5.43167 480 -5.43167 720 5.43167C960 16.295 1200 48.8844 1440 103.064V120Z"
                        fill="white"
                    />
                </svg>
            </div>
        </section>
    )
}