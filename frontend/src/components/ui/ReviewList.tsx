import { useEffect, useState } from 'react';
import type {IReview} from "../../types/review.types.ts";

const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-200'}`}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.118 3.557.97 5.378c.245 1.151-.999 2.03-2.065 1.501L12 18.223l-4.755 2.83c-1.067.53-2.31-.35-2.065-1.501l.97-5.378-4.118-3.557c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
)


export default function ReviewsList({ packageId }: { packageId: number }) {
    const [reviews, setReviews] = useState<IReview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/package/${packageId}`)
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error("Błąd pobierania opinii", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews()
    }, [packageId])

    if (loading) return <p className="text-sm text-gray-500">Ładowanie opinii...</p>

    if (reviews.length === 0) {
        return (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center border border-gray-100">
                <p className="text-gray-500 text-sm italic">Brak opinii dla tego pakietu. Bądź pierwszy!</p>
            </div>
        )
    }

    return (
        <div className="mt-8 border-t border-gray-100 pt-6">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                Opinie użytkowników
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{reviews.length}</span>
            </h4>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((review) => (
                    <div key={review.id}
                         className="bg-slate-50 p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-bold text-gray-900 text-sm block">{review.userName}</span>
                                <span
                                    className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon key={star} filled={star <= review.rating}/>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
                    </div>
                ))}
            </div>
        </div>
    )
}