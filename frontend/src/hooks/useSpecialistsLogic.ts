import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import type {IPackageSimple, ISpecialist} from "../types/specialists.types.ts";
import {CATEGORY_GROUPS, SPECIALISTS_LIST} from "../constants/specialists.tsx";

export const useSpecialistsLogic = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const packageFilterName = location.state?.filterByPackage || null
    const initialSearch = location.state?.filterByName || ""

    const [searchTerm, setSearchTerm] = useState(initialSearch)
    const [selectedCategory, setSelectedCategory] = useState("Wszystkie")
    const [selectedSpecialist, setSelectedSpecialist] = useState<ISpecialist | null>(null)

    const [packages, setPackages] = useState<IPackageSimple[]>([])

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/packages`)
                if (!response.ok) throw new Error("Błąd pobierania")
                const data = await response.json()
                setPackages(data)
            } catch (err) {
                console.error("Nie udało się pobrać pakietów do filtrowania", err)
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

        return packages.filter(pkg => {
            if (!pkg.includedSpecializations) return false

            const specs = pkg.includedSpecializations.split(';').map(s => s.trim())

            return specs.includes(category)
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