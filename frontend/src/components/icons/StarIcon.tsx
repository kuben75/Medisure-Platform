export default function StarIcon({filled, onClick}: { filled: boolean; onClick?: () => void }) {
    return (
        <svg
            onClick={onClick}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            className={`w-4 h-4 cursor-pointer transition-colors duration-200 ${filled ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.53.044.75.688.383 1.018l-4.182 3.73c-.134.12-.197.3-.158.476l1.25 5.358c.124.53-.46.942-.906.67l-4.713-2.88a.563.563 0 00-.58 0l-4.713 2.88c-.447.272-1.03-.14-.906-.67l1.25-5.359a.563.563 0 00-.158-.476l-4.182-3.73c-.367-.33-.147-.974.383-1.018l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
        </svg>
    );
}