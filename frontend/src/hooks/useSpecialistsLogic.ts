import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import type { ISpecialist} from "../types/specialists.types.ts";
import {CATEGORY_GROUPS, SPECIALISTS_LIST} from "../constants/specialists.tsx";
import type {IPricingPlan} from "../types/pricing.types.ts";

export const useSpecialistsLogic = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const packageFilterName = location.state?.filterByPackage || null
    const initialSearch = location.state?.filterByName || ""

    const [searchTerm, setSearchTerm] = useState(initialSearch)
    const [selectedCategory, setSelectedCategory] = useState("Wszystkie")
    const [selectedSpecialist, setSelectedSpecialist] = useState<ISpecialist | null>(null)

    const [packages, setPackages] = useState<IPricingPlan[]>([])

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/packages`)
                if (!response.ok) throw new Error("Błąd pobierania")

                const rawData = await response.json()

                const adaptedData = rawData.map((pkg: any) => {

                    const safeParse = (input: any) => {
                        if (!input) return []
                        if (Array.isArray(input)) return input
                        if (typeof input === 'string') return input.split(';').map(s => s.trim())
                        return []
                    }

                    return {
                        ...pkg,
                        includedSpecializations: safeParse(pkg.includedSpecializations),
                        features: safeParse(pkg.features)
                    }
                })

                setPackages(adaptedData)
            } catch (err) {
                console.error("Nie udało się pobrać pakietów", err)
            }
        }
        fetchPackages()
    }, [])

    useEffect(() => {
        if (!packageFilterName && !initialSearch) window.scrollTo(0, 0)
        if (initialSearch) setSearchTerm(initialSearch)
    }, [packageFilterName, initialSearch])

    const filtered = useMemo(() => {
        return SPECIALISTS_LIST.filter(s => {
            const matchesSearch =
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.title.toLowerCase().includes(searchTerm.toLowerCase())

            let matchesCategory = false

            if (selectedCategory === "Wszystkie") {
                matchesCategory = true
            } else {
                const allowedCategories = CATEGORY_GROUPS[selectedCategory]
                if (allowedCategories && allowedCategories.includes(s.category))
                    matchesCategory = true
            }
            return matchesSearch && matchesCategory
        })
    }, [searchTerm, selectedCategory])


    const getRealPackagesForSpecialist = (category: string) => {
        if (!packages || packages.length === 0) return []

        console.log(`🔍 Sprawdzam specjalistę z kategorii: "${category}"`)

        return packages.filter(pkg => {
            const specs = (pkg.includedSpecializations as any)

            if (!specs || !Array.isArray(specs)) {
                console.log(`   ❌ Pakiet "${pkg.name}" ma błędne specjalizacje:`, specs)
                return false
            }


            const hasMatch = specs.some((s: string) =>
                s.trim().toLowerCase() === category.trim().toLowerCase()
            )

            if (hasMatch) {
                console.log(`   ✅ SUKCES! Pakiet "${pkg.name}" pasuje! (Znaleziono: ${specs})`)
            }

            return hasMatch
        }).map(pkg => pkg.name)
    }
    return {
        navigate,
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        filtered,
        selectedSpecialist,
        setSelectedSpecialist,
        getRealPackagesForSpecialist
    }
}