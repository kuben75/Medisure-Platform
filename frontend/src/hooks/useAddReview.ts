import {handleApiError} from "../utils/apiErrorHandler.ts";
import React, {useState} from "react";
import {useAuth} from "./useAuth.ts";
import {useNotification} from "./UseNotification.ts";
import type { IUseAddReviewParams} from "../types/review.types.ts";
const API_URL = `${import.meta.env.VITE_API_URL}/reviews`

export const useAddReview = ({ onClose, packageId }: IUseAddReviewParams) => {
    const { token } = useAuth()
    const { notify } = useNotification()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            notify.error("Musisz być zalogowany.");
            return;
        }

        if (rating === 0) {
            notify.error("Musisz wybrać ocenę (kliknij w gwiazdki).")
            return
        }

        if (comment.length < 5) {
            notify.error("Komentarz jest za krótki (min. 5 znaków).")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    packageId,
                    rating,
                    comment
                })
            })

            if (!response.ok) throw await response.json()

            notify.success("Opinia dodana! Czeka na zatwierdzenie przez moderatora.")

            setRating(0)
            setComment('')
            onClose()

        } catch (err) {
            handleApiError(err, notify)
        } finally {
            setIsLoading(false)
        }
    }
    return {
        rating,
        setRating,
        comment,
        setComment,
        isLoading,
        hoverRating,
        setHoverRating,
        handleSubmit
    }
}