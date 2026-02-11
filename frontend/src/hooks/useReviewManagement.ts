import {useEffect, useState} from "react";
import type {IPendingReview} from "../types/review.types.ts";
import {useAuth} from "./useAuth.ts";
import {useNotification} from "./UseNotification.ts";
import {useConfirm} from "./UseConfrim.ts";

export const useReviewManagement = () => {

    const API_URL = `${import.meta.env.VITE_API_URL}/reviews`;
    const [reviews, setReviews] = useState<IPendingReview[]>([]);
    const [loading, setLoading] = useState(true);
    const {token} = useAuth();
    const {notify} = useNotification();
    const confirm = useConfirm();

    const fetchPendingReviews = async () => {
        if (!token) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/pending`, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingReviews();
    }, [token]);

    const handleApprove = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/${id}/approve`, {
                method: 'PUT',
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!response.ok) {
                throw new Error("Błąd zatwierdzania");
            }

            notify.success("Opinia zatwierdzona i opublikowana!");
            await fetchPendingReviews();
        } catch (err) {
            notify.error("Nie udało się zatwierdzić opinii." + err);
        }
    };

    const handleReject = async (id: number) => {
        const isConfirmed = await confirm({
            title: "Potwierdzenie usunięcia",
            description: "Czy na pewno chcesz trwale usunąć tę opinię?",
            confirmText: "Usuń",
            cancelText: "Anuluj",
            variant: "danger"
        });
        if (!isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!response.ok) {
                throw new Error("Błąd usuwania");
            }

            notify.success("Opinia usunięta.");
            fetchPendingReviews();
        } catch (err) {
            notify.error("Nie udało się usunąć opinii." + err);
        }
    }
    return {
        reviews,
        loading,
        handleApprove,
        handleReject
    }
}