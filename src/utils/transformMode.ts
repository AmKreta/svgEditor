import { TRANSFORM_MODE } from './constant';

let activeTransformMode: TRANSFORM_MODE = TRANSFORM_MODE.TRANSLATE;

export function getActiveTransformMode(): TRANSFORM_MODE {
    return activeTransformMode;
}

export function setActiveTransformMode(mode: TRANSFORM_MODE) {
    activeTransformMode = mode;
    if (typeof document !== 'undefined') {
        // the canvas styles its shape cursors off this attribute
        document.body.dataset.transformMode = mode;
    }
}

export function isEditableKeyboardTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}
