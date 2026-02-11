import {createContext, useContext} from "react";

import type {IComparisonContext} from "../types/pricing.types.ts";

export const ComparisonContext = createContext<IComparisonContext>(null as any);

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error("useComparison must be used within a ComparisonProvider");
    }

    return context
}