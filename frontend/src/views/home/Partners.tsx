import {partners} from "../../constants/MockData.ts";

export default function Partners() {
    return (
       <section className="py-20 px-4 bg-white">
        <div className="text-center">
            <h2 className="h2-primary">Nasi Partnerzy</h2>
            <div className="relative w-full overflow-hidden">
                <div className="flex animate-scroll my-12">
                {[...partners, ...partners, ...partners].map((l, i) => (
                    <div key={i} className="flex-shrink-0 mx-8">
                        <img src={l.src} alt={l.name} className="h-12 object-contain" />
                    </div>
                ))}
                </div>
            </div>
        </div>
       </section>
    )
}