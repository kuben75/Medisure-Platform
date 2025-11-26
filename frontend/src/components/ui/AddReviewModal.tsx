import React, { useState } from 'react';
import Modal from '../ui/Modal.tsx';
import Button from '../ui/Button.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotification } from '../../context/NotificationContext.tsx';
import type {AddReviewModalProps} from "../../types/review.types.ts";
import StarIcon from "../icons/StarIcon.tsx";

const API_URL = `${import.meta.env.VITE_API_URL}/reviews`

export default function AddReviewModal({ isOpen, onClose, packageId, packageName }: AddReviewModalProps) {
    const { token } = useAuth()
    const { notify } = useNotification()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        if (rating === 0) {
            notify.error("Musisz wybrać ocenę.")
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
            const data = await response.json()

            if (!response.ok) {
                let errorMsg = "Wystąpił nieoczekiwany błąd."

                if (data.message || data.Message) errorMsg = data.message || data.Message

                else if (data.errors) errorMsg = Object.values(data.errors).flat().join(', ')

                else if (data.title) errorMsg = data.title

                throw new Error(errorMsg);
            }

            notify.success("Opinia dodana! Czeka na moderację.")
            onClose()
            setRating(0)
            setComment('')
        } catch (err: any) {
            notify.error(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oceń pakiet</h2>
            <p className="text-blue-600 font-semibold mb-6 text-lg">{packageName}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Twoja ocena</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                filled={star <= rating}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Komentarz</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                              required minLength={5} rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none resize-none"
                              placeholder="Co Ci się podoba w tym pakiecie? Jak oceniasz usługi?"/>
                </div>

                <Button type="submit" className="w-full py-3" disabled={isLoading}>
                    {isLoading ? "Wysyłanie..." : "Dodaj opinię"}
                </Button>
            </form>
        </Modal>
    )
}