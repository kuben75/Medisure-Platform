import {partners} from "../../constants/MockData.ts";

export default function Partners() {
    const loopedPartners = [...partners, ...partners, ...partners, ...partners];

    return (
        <section className="py-16 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4 text-center">
                <p className="text-3xl md:text-4xl font-bold text-gray-800 mb-10 md:mb-20">
                    Nasi partnerzy
                </p>

                <div
                    className="relative w-full overflow-hidden  [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">

                    <div className="flex animate-scroll hover:[animation-play-state:paused] w-max">
                        {loopedPartners.map((partner, index) => (
                            <div key={index} className="mx-8 w-32 md:w-40 flex items-center justify-center">
                                <img
                                    src={partner.src}
                                    alt={partner.name}
                                    className="h-10 md:h-12 object-contain  opacity-60 transition-all duration-300 cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}