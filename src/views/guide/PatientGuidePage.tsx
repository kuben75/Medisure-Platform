import GuideHero from "./GuideHero.tsx";
import WhatToLookFor from "./WhatToLookFor.tsx";
import FaqSection from "./FaqSection.tsx";
import HelpSection from "./HelpSection.tsx";

export default function PatientGuidePage() {
    return (
        <>
            <GuideHero />
            <WhatToLookFor />
            <FaqSection />
            <HelpSection />
        </>
    )
}