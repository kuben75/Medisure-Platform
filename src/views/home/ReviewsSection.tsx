import {reviews} from "../../tests/MockData.ts";
import {useState} from "react";

export default function ReviewsSection() {
    const [currentReview, setCurrentReview] = useState(0)
    return (
        <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="h2-primary">Opinie użytkowników</h2>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-3xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center space-x-4">
                        <img src={reviews[currentReview].img} alt={reviews[currentReview].name}
                             className="w-16 h-16 rounded-full object-cover border border-gray-300"/>
                        <div className="text-center md:text-left">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i}
                                         className={`w-5 h-5 ${i < reviews[currentReview].rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                         fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.39-2.462a1 1 0 00-1.176 0l-3.39 2.462c-.784.57-1.838-.197-1.539-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z"/>
                                    </svg>
                                ))}
                            </div>
                            <p className="font-bold text-gray-800 mt-1">{reviews[currentReview].name}</p>
                        </div>
                        <p className="text-gray-600 ml-5 md:ml-8">{reviews[currentReview].comment}</p>
                    </div>
                </div>

                <div className="flex justify-center mt-8 space-x-2">
                    {reviews.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentReview(i)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                i === currentReview ? "bg-[#3B4EDC] scale-110" : "bg-gray-300"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}