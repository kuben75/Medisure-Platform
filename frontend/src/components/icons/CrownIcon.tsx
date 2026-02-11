export default function CrownIcon({className = "w-6 h-6"}: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
             className={className}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125 0 2.219-1.781 4.5-4.5 4.5zM6 15.375c0-2.219 1.781-4.5 4.5-4.5h2.25c.621 0 1.125.504 1.125 1.125V15.375M6 15.375v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v3.375m9-3.375v-4.5c0-.621.504-1.125 1.125-1.125h.75c.621 0 1.125.504 1.125 1.125v3.25a3 3 0 003 3v.375M9 7.5v-3.25a3 3 0 003-3h.75c.621 0 1.125.504 1.125 1.125v4.5m-3-1.125a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"/>
        </svg>
    );
}