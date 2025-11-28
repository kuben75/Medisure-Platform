import {type ReactNode, useState} from "react"
import {useNotification} from "../hooks/UseNotification.ts"
import type {IPricingPlan} from "../types/pricing.types.ts"
import { ComparisonContext } from "../hooks/useComparison.tsx"
export const ComparisonProvider = ({children}: {children: ReactNode}) => {
    const [selectedPackages, setSelectedPackages] = useState<IPricingPlan[]>([]);
    const {notify} = useNotification()

    const addToComparison = (pkg: IPricingPlan) => {
        if(selectedPackages.length >= 3) {
            notify.info("Możesz porównać maksymalnie 3 pakiety naraz.")
            return
        }
        if (selectedPackages.some(p => p.id === pkg.id))
            return

        setSelectedPackages(prev => [...prev, pkg])
        notify.success(`Dodano pakiet "${pkg.name}" do porównania.`)
    }
    const removeFromComparison = (packageId: number) => setSelectedPackages(prev => prev.filter(p => p.id !== packageId))
    const isInComparison = (packageId: number) => selectedPackages.some(p => p.id === packageId)
    const clearComparison = () => setSelectedPackages([])

    const value = {
        selectedPackages,
        addToComparison,
        removeFromComparison,
        isInComparison,
        clearComparison
    }
    return (
        <ComparisonContext.Provider value={value}>
            {children}
        </ComparisonContext.Provider>
    )
}