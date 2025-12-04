import { useEffect, useState } from "react"
import Button from "../ui/Button.tsx"
import type {IPendingReview} from "../../types/review.types.ts"
import CheckIcon from "../icons/CheckIcon.tsx"
import StarItem from "../icons/StarItem.tsx"
import {useConfirm} from "../../hooks/UseConfrim.ts";
import {useNotification} from "../../hooks/UseNotification.ts";
import {useAuth} from "../../hooks/useAuth.ts";

const API_URL = `${import.meta.env.VITE_API_URL}/reviews`

function XIcon() {
    return null;
}

export default function ReviewManagement() {
    const [reviews, setReviews] = useState<IPendingReview[]>([])
    const [loading, setLoading] = useState(true)
    const { token } = useAuth()
    const { notify } = useNotification()
    const confirm = useConfirm()

    const fetchPendingReviews = async () => {
        if (!token) return

        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setReviews(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPendingReviews()
    }, [token]);

    const handleApprove = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/${id}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Błąd zatwierdzania")

            notify.success("Opinia zatwierdzona i opublikowana!")
            fetchPendingReviews();
        } catch (err) {
            notify.error("Nie udało się zatwierdzić opinii." + err)
        }
    };

    const handleReject = async (id: number) => {
        const isConfirmed = await confirm ({
            title: "Potwierdzenie usunięcia",
            description: "Czy na pewno chcesz trwale usunąć tę opinię?",
            confirmText: "Usuń",
            cancelText: "Anuluj",
            variant: "danger"
        })
        if (!isConfirmed) return

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Błąd usuwania")

            notify.success("Opinia usunięta.")
            fetchPendingReviews();
        } catch (err) {
            notify.error("Nie udało się usunąć opinii." + err);
        }
    }

    if (loading) return <div>Ładowanie opinii...</div>

    return (
        <div className="mt-8 bg-slate-50 p-6 rounded-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">Moderacja Opinii</h2>
                <p className="text-gray-500">Opinie czekające na zatwierdzenie: {reviews.length}</p>
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">Brak nowych opinii do sprawdzenia.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">

                            <div className="md:w-1/4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
                                <p className="font-bold text-gray-800">{review.userName}</p>
                                <p className="text-xs text-gray-500 mb-2">{review.userEmail}</p>
                                <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold inline-block">
                                    {review.packageName}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex-grow">
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <StarItem key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                                    ))}
                                    <span className="ml-2 font-bold text-gray-700">{review.rating}/5</span>
                                </div>
                                <p className="text-gray-600 italic">"{review.comment}"</p>
                            </div>

                            <div className="flex flex-row md:flex-col gap-2 justify-center md:w-32 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                <Button
                                    onClick={() => handleApprove(review.id)}
                                    className="!bg-green-600 hover:!bg-green-700 !text-white !text-sm !py-2 flex items-center justify-center gap-2"
                                >
                                    <CheckIcon /> Zatwierdź
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleReject(review.id)}
                                    className="!text-red-600 !border-red-200 hover:!bg-red-50 !text-sm !py-2 flex items-center justify-center gap-2"
                                >
                                    <XIcon /> Odrzuć
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}