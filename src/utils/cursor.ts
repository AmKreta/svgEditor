const ROTATE_CURSOR_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' fill='black' stroke='white' stroke-width='1'/></svg>`;

export const ROTATE_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(ROTATE_CURSOR_SVG)}") 12 12, crosshair`;

export const CURSORS = {
    DRAGGING: 'grabbing',
    SCALE: 'nwse-resize',
    ROTATE: ROTATE_CURSOR,
};

/**
 * Forces a cursor on the whole document while a gesture is in progress, so it
 * doesn't flicker as the pointer moves off the element that started the drag.
 * Pass null to restore normal cursors.
 */
export function setGlobalCursor(cursor: string | null) {
    if (typeof document === 'undefined') {
        return;
    }
    const root = document.documentElement;
    if (cursor) {
        root.style.setProperty('--global-cursor', cursor);
        root.classList.add('global-cursor');
    } else {
        root.classList.remove('global-cursor');
        root.style.removeProperty('--global-cursor');
    }
}
