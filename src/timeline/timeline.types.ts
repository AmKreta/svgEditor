/** A flattened property path (e.g. `x`, `style.fill`, `style.translate.0`, `points.2.1`) to its value. */
export type FLAT_STATE = Record<string, number | string>;

/**
 * One animation segment. Every shape it mentions animates from its state at `start`
 * (its own properties plus everything earlier cutscenes changed) to the values in
 * `state[shapeId]`. Only properties that change are stored.
 */
export interface CUTSCENE {
    id: string;
    name: string;
    /** seconds */
    start: number;
    /** seconds */
    end: number;
    /** GSAP ease name */
    ease: string;
    state: { [shapeId: string]: FLAT_STATE };
}

/** A named row of cutscenes. Cutscenes in one timeline never overlap. */
export interface TIMELINE_TRACK {
    id: string;
    name: string;
    cutscenes: CUTSCENE[];
}

export interface CLIP_REF {
    timelineId: string;
    id: string;
}

/** Set while a cutscene is selected: shape edits go into it instead of the shapes. */
export interface EDITING {
    timelineId: string;
    cutsceneId: string;
    /** animatable properties of every shape before editing started, restored afterwards */
    backup: { [shapeId: string]: FLAT_STATE };
    /** each shape's state when the cutscene starts; edits are stored relative to this */
    from: { [shapeId: string]: FLAT_STATE };
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
