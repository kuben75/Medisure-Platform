import Button from "../ui/Button.tsx";
import CheckIcon from "../icons/CheckIcon.tsx";
import StarItem from "../icons/StarItem.tsx";
import XIcon from "../icons/XIcon.tsx";
import {useReviewManagement} from "../../hooks/useReviewManagement.ts";

export default function ReviewManagement() {
    const {reviews, loading, handleApprove, handleReject} = useReviewManagement();

    if (loading) {
        return <div>Ładowanie opinii...</div>;
    }

    return (
        <div className="mt-4 md:mt-8 bg-white md:bg-slate-50 p-4 md:p-6 rounded-xl md:border border-gray-200">
            <div className="mb-6 flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Moderacja Opinii</h2>
                <span
                    className="bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-orange-200">
                    {reviews.length} oczekujących
                </span>
            </div>

            {reviews.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center py-16 bg-white md:bg-transparent rounded-xl border border-dashed border-gray-300 md:border-gray-300">
                    <div
                        className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <CheckIcon className="w-8 h-8 text-green-500"/>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Wszystko czyste!</h3>
                    <p className="text-gray-500 text-sm mt-1">Brak nowych opinii do moderacji.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reviews.map((review) => (
                        <div key={review.id}
                             className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-5 md:gap-8 transition-all hover:shadow-md">

                            <div
                                className="md:w-[240px] flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div
                                        className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{review.userName}</p>
                                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('pl-PL')}</p>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mb-3 break-all">{review.userEmail}</p>

                                <div className="mt-auto">
                                    <span
                                        className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                                        {review.packageName}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-grow">
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <StarItem key={i}
                                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}/>
                                    ))}
                                    <span className="ml-2 font-bold text-gray-700 text-sm">{review.rating}/5</span>
                                </div>
                                <div className="relative pl-4 border-l-2 border-gray-200">
                                    <p className="text-gray-600 italic text-sm leading-relaxed">
                                        "{review.comment}"
                                    </p>
                                </div>
                            </div>

                            <div
                                className="flex flex-row md:flex-col gap-2 justify-end md:justify-center md:w-32 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                <Button
                                    onClick={() => handleApprove(review.id)}
                                    className="!bg-green-600 hover:!bg-green-700 !text-white !text-xs !py-2.5 flex-1 md:flex-none flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <CheckIcon className="w-4 h-4"/> Zatwierdź
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleReject(review.id)}
                                    className="!text-red-600 !border-red-200 hover:!bg-red-50 !text-xs !py-2.5 flex-1 md:flex-none flex items-center justify-center gap-2"
                                >
                                    <XIcon className="w-5 h-5"/> Odrzuć
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}