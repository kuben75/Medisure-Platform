import HeroSection from "./HeroSection.tsx";
import WhyUs from "./WhyUs.tsx";
import ReviewsSection from "../../components/sections/ReviewsSection.tsx";
import Partners from "./Partners.tsx";
import SpecialistsPromo from "./SpecialistsPromo.tsx";
export default function HomePage() {
    return (
        <>
            <HeroSection />
            <WhyUs />
            <SpecialistsPromo />
            <ReviewsSection />
            <Partners />
        </>
    )
}