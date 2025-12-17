import { useEffect, useState } from "react";
import StarItem from "../../components/icons/StarItem.tsx";
import type { IReviewDisplay } from "../../types/review.types.ts";
import {DEFAULT_REVIEWS} from "../../constants/reviews.ts";

const API_URL = `${import.meta.env.VITE_API_URL}/reviews/latest`

export default function ReviewsSection() {
    const [reviews, setReviews] = useState<IReviewDisplay[]>([])
    const [loading, setLoading] = useState(true)
    const [currentReview, setCurrentReview] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(API_URL)
                if (response.ok) {
                    const data = await response.json()
                    if (data && data.length > 0)
                        setReviews(data)
                }
            } catch (error) {
                console.error("Błąd pobierania opinii:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchReviews()
    }, [])

    const displayReviews = reviews.length > 0 ? reviews : DEFAULT_REVIEWS;

    useEffect(() => {
        if (isPaused) return
        const interval = setInterval(() => {
            setCurrentReview((prev) => (prev + 1) % displayReviews.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [displayReviews.length, isPaused])

    const handleDotClick = (index: number) => setCurrentReview(index)


    if (loading) return null

    const currentData = displayReviews[currentReview];

    return (
        <section className="py-16 md:py-24 px-4 bg-white border-t border-gray-100">
            <div className="max-w-4xl mx-auto text-center">

                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 md:mb-12">
                    Co mówią nasi użytkownicy?
                </h2>

                <div
                    className="relative bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100 max-w-3xl mx-auto transition-all duration-300 hover:shadow-2xl"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div key={currentData.id} className="flex flex-col md:flex-row items-center gap-6 md:gap-8 animate-fade-in">

                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold text-white bg-gradient-to-br from-[#4E61F6] to-indigo-600 shadow-lg shadow-indigo-200">
                                {currentData.avatarText}
                            </div>
                        </div>

                        <div className="flex-grow text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start mb-3 gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <StarItem key={i} className={`w-5 h-5 md:w-6 md:h-6 ${i < currentData.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                                ))}
                            </div>

                            <blockquote className="text-gray-600 italic text-base md:text-lg leading-relaxed mb-4">
                                "{currentData.comment}"
                            </blockquote>

                            <p className="font-bold text-gray-900 text-lg">
                                {currentData.userName}
                            </p>
                        </div>
                    </div>
                </div>

                {displayReviews.length > 1 && (
                    <div className="flex justify-center mt-8 md:mt-10 space-x-3">
                        {displayReviews.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handleDotClick(i)}
                                className={`transition-all duration-300 rounded-full ${
                                    i === currentReview
                                        ? "bg-[#4E61F6] w-8 h-2.5 shadow-md shadow-blue-200"
                                        : "bg-gray-300 w-2.5 h-2.5 hover:bg-gray-400"
                                }`}
                                aria-label={`Przejdź do opinii ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </section>
    )
}