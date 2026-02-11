export const formatTime = (date: Date) => {
    const now = new Date();
    const isToday = now.toDateString() === date.toDateString();
    return isToday
        ? date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        : date.toLocaleDateString([], {month: 'short', day: 'numeric'});
};