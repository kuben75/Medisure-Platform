import {useEffect, useState} from "react";
import StarItem from "../../components/icons/StarItem.tsx";
import type {IReviewDisplay} from "../../types/review.types.ts";
const API_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/reviews/latest`

export default function ReviewsSection() {
    const [reviews, setReviews] = useState<IReviewDisplay[]>([])
    const [loading, setLoading] = useState(true)
    const [currentReview, setCurrentReview] = useState(0)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(API_URL)
                if (response.ok) {
                    const data = await response.json()
                    setReviews(data)
                }
            } catch (error) {
                console.error("Błąd pobierania opinii na stronę główną", error)
            } finally {
                setLoading(false)
            }
        }
        fetchReviews()
    }, [])
    if(loading) return null
    const displayReviews = reviews.length > 0 ? reviews : [
        {
            id: 1,
            userName: "Piotr",
            avatarText: "P",
            rating: 5,
            comment: "Bardzo pomocna strona przy szukaniu najlepszego pakietu medycznego. " +
                "Szybko znalazłem ofertę spełniającą moje oczekiwania.",
        },
        {
            id: 2,
            userName: "Anna",
            avatarText: "A",
            rating: 4,
            comment: "Dobre porównanie ofert, szybka obsługa!",
        },
        {
            id: 3,
            userName: "Marek",
            avatarText: "M",
            rating: 5,
            comment: "Świetne doświadczenie, polecam każdemu!",
        }
    ]
    const handleDotClick = (index: number) => {
        setCurrentReview(index)
    }
    return (
        <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="h2-primary">Opinie użytkowników</h2>
                    <div className="bg-white- p-8 rounded-xl shadow-lg border border-gray-200 max-w-3xl mx-auto transition-all duration-500">
                        <div className="flex flex-col md:flex-row items-center space-x-4">
                            <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                                {displayReviews[currentReview].avatarText}
                            </div>
                            <div className="text-center md:text-left flex-grow mt-4 md:mt-0">
                                <div className="flex items-center justufy-center md:justify-start mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <StarItem key={i} className={`w-5 h-5 ${i < displayReviews[currentReview].rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <p className="font-bold text-gray-800 text-lg">
                                    {displayReviews[currentReview].userName}
                                </p>
                                <p className="text-gray-600 mt-2 italic text-lg">
                                    "{displayReviews[currentReview].comment}"
                                </p>
                            </div>
                        </div>
                    </div>

                {displayReviews.length > 1 && (
                    <div className="flex justify-center mt-8 space-x-3">
                        {displayReviews.map((_, i) => (
                            <button key={i} onClick={() => handleDotClick(i)}
                                    className={`transition-all duration-300 rounded-full ${i === currentReview
                                    ? "bg-[#3B4EDC] w-8 h-3"
                                    : "bg-gray-300 w-3 h-3 hover:bg-gray-400"
                                    }`} aria-label={`Przejdź do opinii ${i + 1}`}></button>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}