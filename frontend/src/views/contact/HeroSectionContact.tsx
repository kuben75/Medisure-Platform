export default function HelpSection() {
    return (
        <section
            className="relative bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#4338ca] text-white overflow-hidden py-24 md:py-32">

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl opacity-30"></div>
            </div>

            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
                <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
                    <span
                        className="inline-block py-1 px-3 rounded-full bg-blue-500/30 border border-blue-400/30 text-xs font-bold uppercase tracking-widest text-blue-100 mb-6 backdrop-blur-sm">
                        Centrum Wsparcia
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                        Jak możemy Ci <br/> <span className="text-blue-200">pomóc?</span>
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 opacity-90 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                        Nasi doradcy są dostępni, aby odpowiedzieć na pytania o ofertę, pomóc w konfiguracji pakietu lub
                        rozwiązać problemy techniczne.
                    </p>

                    <div
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                        <span className="relative flex h-3 w-3">
                          <span
                              className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span
                            className="text-sm font-medium text-white">Jesteśmy online i odpowiadamy na zgłoszenia</span>
                    </div>
                </div>

                <div className="md:w-1/2 flex justify-center md:justify-end relative">
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl transform rotate-3 scale-105 opacity-20 blur-sm"></div>

                    <img
                        src="src/assets/doradca.svg"
                        alt="Doradca klienta"
                        className="relative w-full max-w-md object-cover rounded-2xl "
                    />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-16 md:h-24 text-white translate-y-1">
                <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                    <path fill="#ffffff" fillOpacity="1"
                          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
        </section>
    )
}