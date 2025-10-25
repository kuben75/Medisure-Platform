import StarItem from "../icons/StarItem.tsx";
import type {TRatingProps} from "../../types/types.ts";

export default function Rating({rating, reviews}: TRatingProps){
    const full :number = Math.floor(rating)
    const hasHalf: boolean = rating - full >= 0.5
    return (
        <div className="mt-auto mb-2 flex items-center justify-center gap-3">

            <div className="flex items-center bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">
                <StarItem className="w-4 h-4" />
                <span className="ml-1.5 font-bold text-sm">{rating.toFixed(1)}</span>
            </div>

            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => {
                    const color = i <= full ? "text-yellow-400"
                        : i === full + 1 && hasHalf ? "text-yellow-400 opacity-50"
                            : "text-gray-300";
                    return (
                        <StarItem key={i} className={`w-5 h-5 ${color}`} />
                    );
                })}
            </div>

            <span className="text-sm text-gray-500 font-medium">({reviews} opinii)</span>
        </div>
    );

}