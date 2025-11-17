import {reviews} from "../../tests/MockData.ts";
import {useState} from "react";
import StarItem from "../../components/icons/StarItem.tsx";

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
                                   <StarItem className={`w-5 h-5 ${i < reviews[currentReview].rating ? "text-yellow-400" : "text-gray-300"}`} key={i} />
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