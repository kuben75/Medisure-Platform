import type {IAddReviewModalProps} from "../../../types/review.types.ts";
import Modal from "./Modal.tsx";
import {useAddReview} from "../../../hooks/useAddReview.ts";
import StarIcon from "../../icons/StarIcon.tsx";
import Button from "../Button.tsx";


export default function AddReviewModal({isOpen, onClose, packageId, packageName}: IAddReviewModalProps) {

    const {
        rating, setRating, comment,
        setComment, isLoading, hoverRating,
        setHoverRating, handleSubmit
    } = useAddReview({packageId, onClose});

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Oceń pakiet</h2>
                <p className="text-[#4E61F6] font-semibold text-lg">{packageName}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Twoja
                        ocena</label>
                    <div
                        className="flex gap-2"
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        {[1, 2, 3, 4, 5].map((star) => (
                            <div
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                className="cursor-pointer transform hover:scale-110 transition-transform"
                            >
                                <StarIcon
                                    filled={star <= (hoverRating || rating)}
                                    onClick={() => setRating(star)}
                                />
                            </div>
                        ))}
                    </div>
                    {rating > 0 && <span className="text-sm font-bold text-gray-400 mt-2">{rating} / 5</span>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Twój komentarz</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        minLength={5}
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] focus:border-transparent outline-none resize-none transition-all"
                        placeholder="Co Ci się podoba w tym pakiecie? Jak oceniasz jakość usług?"
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                        {comment.length} / 500 znaków
                    </div>
                </div>

                <Button variant="primary" type="submit" className="w-full !py-3 text-lg shadow-lg" disabled={isLoading}>
                    {isLoading ? "Wysyłanie..." : "Dodaj opinię"}
                </Button>
            </form>
        </Modal>
    );
}