import { useEffect, useState } from "react"
import StarItem from "../icons/StarItem.tsx"
import type { IReviewDisplay } from "../../types/review.types.ts"
import { DEFAULT_REVIEWS } from "../../constants/reviews.ts"

const API_URL = `${import.meta.env.VITE_API_URL}/reviews/latest`

export default function ReviewsSection() {
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
                    if (data && data.length > 0)
                        setReviews(data);
                     else
                        setReviews(DEFAULT_REVIEWS);

                } else {
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
        if (isPaused || reviews.length === 0) return;
        const interval = setInterval(() => {
            setCurrentReview((prev) => (prev + 1) % reviews.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [reviews.length, isPaused]);

    const handleDotClick = (index: number) => setCurrentReview(index);

    if (loading) return null;

    const currentData = reviews[currentReview];

    if (!currentData) return null;

    return (
        <section className="py-20 md:py-28 px-4 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-5xl mx-auto text-center relative z-10">

                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    Co mówią nasi użytkownicy?
                </h2>
                <p className="text-gray-500 mb-12 max-w-2xl mx-auto text-lg">
                    Zobacz opinie osób, które korzystają z naszych pakietów medycznych na co dzień.
                </p>

                <div
                    className="relative bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 mx-auto transition-all duration-300 hover:shadow-2xl max-w-4xl"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {currentData.packageName && (
                        <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-indigo-100 animate-fade-in">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            {currentData.packageName}
                        </div>
                    )}

                    <div key={currentData.id} className="flex flex-col md:flex-row items-center md:items-start gap-8 animate-fade-in mt-12 md:mt-3">

                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl md:text-4xl font-black text-white bg-gradient-to-br from-[#4E61F6] to-indigo-600 shadow-xl shadow-indigo-200 ring-4 ring-white">
                                {currentData.avatarText}
                            </div>
                        </div>

                        <div className="flex-grow text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start mb-4 gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <StarItem
                                        key={i}
                                        className={`w-5 h-5 md:w-6 md:h-6 ${i < currentData.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                                    />
                                ))}
                            </div>

                            <div className="relative">
                                <blockquote className="text-gray-700 font-medium text-lg md:text-xl leading-relaxed mb-6 relative z-10">
                                    {currentData.comment}
                                </blockquote>
                            </div>

                            <div>
                                <p className="font-bold text-gray-900 text-lg">
                                    {currentData.userName}
                                </p>
                                <p className="text-sm text-gray-400">Zweryfikowany użytkownik</p>
                            </div>
                        </div>
                    </div>
                </div>

                {reviews.length > 1 && (
                    <div className="flex justify-center mt-10 space-x-3">
                        {reviews.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handleDotClick(i)}
                                className={`transition-all duration-300 rounded-full ${
                                    i === currentReview
                                        ? "bg-[#4E61F6] w-10 h-3 shadow-lg shadow-indigo-200"
                                        : "bg-gray-300 w-3 h-3 hover:bg-gray-400"
                                }`}
                                aria-label={`Przejdź do opinii ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px) scale(0.98); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                }
            `}</style>
        </section>
    );
}