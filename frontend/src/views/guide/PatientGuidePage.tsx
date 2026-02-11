import GuideHero from "./GuideHero.tsx";
import WhatToLookFor from "./WhatToLookFor.tsx";
import FaqSection from "../../components/sections/FaqSection.tsx";
import HelpGuideSection from "../../components/sections/HelpGuideSection.tsx";

export default function PatientGuidePage() {
    return (
        <>
            <GuideHero/>
            <WhatToLookFor/>
            <FaqSection/>
            <HelpGuideSection/>
        </>
    );
}