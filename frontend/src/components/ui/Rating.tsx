import StarItem from "../icons/StarItem.tsx";
import type { IRatingProps } from "../../types/ui.types.ts";

export default function Rating({ rating, reviews, className }: IRatingProps) {
    const containerClass = className || "mt-auto mb-2 flex items-center justify-center gap-3";

    const getStarFillPercent = (index: number) => {
        const fill = Math.max(0, Math.min(1, rating - (index - 1)));
        return `${fill * 100}%`;
    }

    return (
        <div className={containerClass}>
            <div className="flex items-center bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-0.5 rounded-lg shadow-sm">
                <span className="font-bold text-sm leading-none">{rating.toFixed(1)}</span>
            </div>

            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="relative w-5 h-5">
                        <div className="absolute top-0 left-0 w-full h-full text-gray-200">
                            <StarItem className="w-5 h-5" />
                        </div>

                        <div
                            className="absolute top-0 left-0 h-full overflow-hidden text-yellow-400 z-10"
                            style={{ width: getStarFillPercent(index) }}
                        >
                            <StarItem className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            <span className="text-xs text-gray-400 font-medium">({reviews} opinii)</span>
        </div>
    )
}