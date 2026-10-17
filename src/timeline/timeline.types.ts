/** A flattened property path (e.g. `x`, `style.fill`, `style.translate.0`, `points.2.1`) to its value. */
export type FLAT_STATE = Record<string, number | string>;

/**
 * One animation segment on a shape's row. The shape animates from its state at `start`
 * (its own properties plus everything earlier cutscenes on the row changed) to `state`.
 * Only properties that change are stored.
 */
export interface CUTSCENE {
    id: string;
    /** seconds */
    start: number;
    /** seconds */
    end: number;
    /** GSAP ease name */
    ease: string;
    state: FLAT_STATE;
}

export interface TIMELINE_ROW {
    cutscenes: CUTSCENE[];
}

/** Keyed by shape id; each id renders as its own row. */
export type TIMELINE = { [shapeId: string]: TIMELINE_ROW };

export interface RECORDING {
    /** playhead time the snapshot is taken at */
    time: number;
    /** page shapes as they were before recording started, restored afterwards */
    backup: { [shapeId: string]: any };
    /** flattened state of every shape at `time`, used to work out what changed */
    stateAtTime: { [shapeId: string]: FLAT_STATE };
}

export const MIN_ZOOM_SECONDS = 1;
export const MAX_ZOOM_SECONDS = 60;
export const MIN_CUTSCENE_DURATION = 0.1;
export const DEFAULT_CUTSCENE_DURATION = 1;
export const DEFAULT_EASE = 'power1.inOut';

export const EASES: Array<{ value: string, label: string }> = [
    { value: 'none', label: 'Linear' },
    { value: 'power1.inOut', label: 'Smooth' },
    { value: 'power2.in', label: 'Ease in' },
    { value: 'power2.out', label: 'Ease out' },
    { value: 'back.out(1.7)', label: 'Overshoot' },
    { value: 'elastic.out(1, 0.4)', label: 'Elastic' },
    { value: 'bounce.out', label: 'Bounce' },
];
