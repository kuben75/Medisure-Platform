import React, {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import {useSearchParams, useLocation} from "react-router-dom";
import {useAuth} from "./useAuth.ts";
import {useFavorites} from "./UseFavourites.ts";
import {calculatePersonalizedPrice} from "../utils/pricingHelpers.ts";
import type {IFilterState, IPricingPlan} from "../types/pricing.types.ts";

const API_URL = `${import.meta.env.VITE_API_URL}/packages`;
const ITEMS_PER_PAGE = 5;

export const usePackageCatalog = () => {
    const {user} = useAuth();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const {isFavorite} = useFavorites();

    const [allPackages, setAllPackages] = useState<IPricingPlan[]>([]);
    const [filteredPackages, setFilteredPackages] = useState<IPricingPlan[]>([]);
    const [loading, setLoading] = useState(true);


    const [currentPage, setCurrentPage] = useState(1);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [showPersonalizedPricing, setShowPersonalizedPricing] = useState(true);


    const [specModalOpen, setSpecModalOpen] = useState(false);
    const [specModalData, setSpecModalData] = useState<IPricingPlan | null>(null);
    const hasScrolledToPackage = useRef(false);


    const [filters, setFilters] = useState<IFilterState>({
        category: 'all',
        maxPrice: 2000,
        minSpecialists: 0,
        minFacilities: 0,
        hasDental: false,
        hasHospital: false,
        hasRehabilitation: false,
        searchQuery: '',
        showYearlyPrice: false,
        sortOrder: 'default'
    });


    const userAge = useMemo(() => {
        if (user?.birthDate) {
            const birth = new Date(user.birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        }
        return null;
    }, [user]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(API_URL);
                const data = await response.json();

                const safeParse = (input: any) => {
                    if (!input) return [];
                    if (Array.isArray(input)) return input;
                    if (typeof input === 'string') return input.split(';').map(s => s.trim());
                    return [];
                };

                const cleanData: IPricingPlan[] = data.map((p: any) => ({
                    ...p,
                    includedSpecializations: safeParse(p.includedSpecializations),
                    features: safeParse(p.features),
                    priceValue: p.priceValue || 0,
                    specialistsCount: p.specialistsCount || 0
                }));

                setAllPackages(cleanData);
                setFilteredPackages(cleanData);
            } catch (error) {
                console.error("Błąd pobierania pakietów:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    useEffect(() => {
        if (loading || allPackages.length === 0) {
            return;
        }

        if (location.state?.highlightPackageId) {
            const targetId = location.state.highlightPackageId;
            const targetPkg = allPackages.find(p => p.id === targetId);
            if (targetPkg) {
                setFilters(prev => ({
                    ...prev,
                    category: 'all',
                    searchQuery: '',
                    maxPrice: Math.max(prev.maxPrice, targetPkg.priceValue + 500)
                }));
                return;
            }
        }

        const categoryFromUrl = searchParams.get('category');
        const validCategories = ['Indywidualny', 'Rodzinny', 'Senior', 'Biznesowy'];
        if (categoryFromUrl && validCategories.includes(categoryFromUrl)) {
            setFilters(prev => ({...prev, category: categoryFromUrl, searchQuery: '', maxPrice: 10000}));
            setTimeout(() => document.getElementById('full-catalog')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            }), 100);
        }
    }, [loading, allPackages, location.state, searchParams]);


    useEffect(() => {
        setShowPersonalizedPricing(userAge !== null);
        setHighlightedId(null);
    }, [userAge]);


    const getPersonalizedPrice = useCallback((basePrice: number, category: string) => {
        return calculatePersonalizedPrice(basePrice, category, userAge);
    }, [userAge]);

    const checkBestMatch = useCallback((pkg: IPricingPlan) => {
        if (userAge === null) {
            return false;
        }
        if (userAge >= 60 && pkg.category === 'Senior') {
            return true;
        }
        if (userAge >= 18 && userAge < 30 && (pkg.name.includes("Podstawowy") || pkg.name.includes("Start"))) {
            return true;
        }
        if (userAge >= 30 && userAge < 60 && (pkg.name.includes("Komfort") || pkg.name.includes("Prestige"))) {
            return true;
        }
        return false;
    }, [userAge]);


    useEffect(() => {
        let result = [...allPackages];

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
        }

        if (filters.category !== 'all') {
            result = result.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
        }

        const currentMaxPrice = filters.showYearlyPrice ? filters.maxPrice / 12 : filters.maxPrice;
        result = result.filter(p => {
            const priceToCheck = showPersonalizedPricing ? getPersonalizedPrice(p.priceValue, p.category) : p.priceValue;
            return priceToCheck <= currentMaxPrice;
        });

        if (filters.minSpecialists > 0) {
            result = result.filter(p => p.specialistsCount >= filters.minSpecialists);
        }
        if (filters.minFacilities > 0) {
            result = result.filter(p => p.facilitiesCount >= filters.minFacilities);
        }
        if (filters.hasDental) {
            result = result.filter(p => p.hasDentalCare);
        }
        if (filters.hasHospital) {
            result = result.filter(p => p.hasHospitalization);
        }
        if (filters.hasRehabilitation) {
            result = result.filter(p => p.hasRehabilitation);
        }

        result.sort((a, b) => {
            const favA = isFavorite(a.id) ? 1 : 0;
            const favB = isFavorite(b.id) ? 1 : 0;
            if (favA !== favB) {
                return favB - favA;
            }

            const categoryOrder: Record<string, number> = {
                'Indywidualny': 1,
                'Rodzinny': 2,
                'Senior': 3,
                'Biznesowy': 4
            };

            if (filters.sortOrder === 'default') {
                if (showPersonalizedPricing) {
                    const matchA = checkBestMatch(a) ? 1 : 0;
                    const matchB = checkBestMatch(b) ? 1 : 0;
                    if (matchA !== matchB) {
                        return matchB - matchA;
                    }
                }
                const orderA = categoryOrder[a.category] || 99;
                const orderB = categoryOrder[b.category] || 99;
                if (orderA !== orderB) {
                    return orderA - orderB;
                }

                const priceA = showPersonalizedPricing ? getPersonalizedPrice(a.priceValue, a.category) : a.priceValue;
                const priceB = showPersonalizedPricing ? getPersonalizedPrice(b.priceValue, b.category) : b.priceValue;
                return priceA - priceB;
            }

            const getPriceForSort = (p: IPricingPlan) => showPersonalizedPricing ? getPersonalizedPrice(p.priceValue, p.category) : p.priceValue;

            switch (filters.sortOrder) {
                case 'price_asc':
                    return getPriceForSort(a) - getPriceForSort(b);
                case 'price_desc':
                    return getPriceForSort(b) - getPriceForSort(a);
                case 'rating_desc':
                    return b.averageRating - a.averageRating;
                case 'rating_asc':
                    return a.averageRating - b.averageRating;
                default:
                    return 0;
            }
        });

        setFilteredPackages(result);
        if (!location.state?.highlightPackageId && !hasScrolledToPackage.current) {
            setCurrentPage(1);
        }
    }, [filters, allPackages, userAge, getPersonalizedPrice, isFavorite, location.state, showPersonalizedPricing, checkBestMatch]);

    useEffect(() => {
        if (!loading && filteredPackages.length > 0 && location.state?.highlightPackageId && !hasScrolledToPackage.current) {
            const targetId = location.state.highlightPackageId;
            const index = filteredPackages.findIndex(p => p.id === targetId);
            if (index !== -1) {
                const targetPage = Math.ceil((index + 1) / ITEMS_PER_PAGE);
                if (currentPage !== targetPage) {
                    setCurrentPage(targetPage);
                }
                setTimeout(() => {
                    const element = document.getElementById(`package-card-${targetId}`);
                    if (element) {
                        element.scrollIntoView({behavior: 'smooth', block: 'center'});
                        setHighlightedId(targetId);
                        hasScrolledToPackage.current = true;
                        setTimeout(() => setHighlightedId(null), 2500);
                        window.history.replaceState({}, document.title);
                    }
                }, 500);
            }
        }
    }, [loading, filteredPackages, location.state, currentPage]);

    const handleOpenSpecs = (e: React.MouseEvent, pkg: IPricingPlan) => {
        e.stopPropagation();
        setSpecModalData(pkg);
        setSpecModalOpen(true);
    };

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        document.getElementById('catalog-list')?.scrollIntoView({behavior: 'smooth', block: 'start'});
    };

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredPackages.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);

    return {
        loading,
        filteredPackages: currentItems,
        totalCount: filteredPackages.length,
        totalPages,
        currentPage,
        highlightedId,
        userAge,
        filters, setFilters,
        showPersonalizedPricing, setShowPersonalizedPricing,
        specModalOpen, setSpecModalOpen,
        specModalData,
        getPersonalizedPrice,
        checkBestMatch,
        handleOpenSpecs,
        paginate
    };
};