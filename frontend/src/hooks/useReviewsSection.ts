import {useEffect, useState} from "react";
import type {IReviewDisplay} from "../types/review.types.ts";
import {DEFAULT_REVIEWS} from "../constants/reviews.ts";
const API_URL = `${import.meta.env.VITE_API_URL}/reviews/latest`;

export const useReviewsSection = () => {

    const [reviews, setReviews] = useState<IReviewDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentReview, setCurrentReview] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(API_URL);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setReviews(data);
                    }
                    else {
                        setReviews(DEFAULT_REVIEWS);
                    }
                }
                else {
                    setReviews(DEFAULT_REVIEWS);
                }
            } catch (error) {
                console.error("Błąd pobierania opinii:", error);
                setReviews(DEFAULT_REVIEWS);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    useEffect(() => {
        if (isPaused || reviews.length === 0) {
            return;
        }
        const interval = setInterval(() => {
            setCurrentReview((prev) => (prev + 1) % reviews.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [reviews.length, isPaused]);

    const handleDotClick = (index: number) => setCurrentReview(index);

    return {
        loading,
        reviews,
        currentData: reviews[currentReview],
        handleDotClick,
        setIsPaused,
        currentReview
    };
}