import {useAuth} from "./useAuth.ts";
import {usePackagePurchase} from "./usePackagePurchase.ts";
import {useEffect, useState} from "react";
import type {IPricingPlan} from "../types/pricing.types.ts";
import {useNavigate} from "react-router-dom";
import {useNotification} from "./UseNotification.ts";
import {useComparison} from "./useComparison.ts";

export const useHeroSection = () => {
    const {user} = useAuth();
    const {
        selectedPlan,
        openModal,
        closeModal,
    } = usePackagePurchase();

    const [plans, setPlans] = useState<IPricingPlan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const {notify} = useNotification();
    const {addToComparison} = useComparison();

    const API_URL = `${import.meta.env.VITE_API_URL}/packages`;

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error("Błąd sieci");
                }

                const data: IPricingPlan[] = await response.json();
                const featuredPlans = data.filter((p) => p.isFeatured).slice(0, 3);

                if (featuredPlans.length === 0) {
                    setPlans(data.slice(0, 3));
                }
                else {
                    setPlans(featuredPlans);
                }

            } catch (e) {
                notify.error("Nie udało się pobrać ofert.");
                setError(`Nie udało się pobrać ofert.`);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const handleProceedToCalculator = () => {
        if (!selectedPlan) {
            return;
        }
        const targetId = selectedPlan.id;
        closeModal();
        navigate('/kalkulator', {state: {highlightPackageId: targetId}});
    };

    const handleCompareAndRedirect = () => {
        if (selectedPlan) {
            const targetId = selectedPlan.id;
            addToComparison(selectedPlan);
            closeModal();
            navigate('/kalkulator', {state: {highlightPackageId: targetId}});
        }
    };
    return {
        plans,
        loading,
        error,
        handleProceedToCalculator,
        handleCompareAndRedirect,
        user,
        openModal,
        closeModal,
        selectedPlan,
        navigate
    }
}