import {type ReactNode, useState, useEffect} from "react"
import {useNotification} from "../hooks/UseNotification.ts"
import type {IPricingPlan} from "../types/pricing.types.ts"
import { ComparisonContext } from "../hooks/useComparison.ts"
import {useAuth} from "../hooks/useAuth.ts";
export const ComparisonProvider = ({children}: {children: ReactNode}) => {
    const [selectedPackages, setSelectedPackages] = useState<IPricingPlan[]>([]);
    const {notify} = useNotification()
    const {user} = useAuth()

    const limit = user ? 6 : 3
    useEffect(() => {
        if(selectedPackages.length > limit) {
            setSelectedPackages(prev => prev.slice(0, limit))
            notify.info(`Limit porównania pakietów to ${limit}. Nadmiarowe pakiety zostały usunięte z porównania.`)
        }
    }, [user, limit])

    const addToComparison = (pkg: IPricingPlan) => {
        if(selectedPackages.length >= limit) {
            if(!user)
                notify.info(`Zaloguj się, aby porównać więcej niż ${limit} pakiety.`)
            else
                notify.info(`Osiągnięto limit porównania pakietów. Usuń jakiś pakiet, aby dodać nowy.`)

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
        clearComparison,
        limit
    }
    return (
        <ComparisonContext.Provider value={value}>
            {children}
        </ComparisonContext.Provider>
    )
}