/** 75.5 -> "1:15.50" */
export function formatTime(seconds: number) {
    const safe = Math.max(0, seconds);
    const minutes = Math.floor(safe / 60);
    const rest = safe - minutes * 60;
    return `${minutes}:${rest.toFixed(2).padStart(5, '0')}`;
}
