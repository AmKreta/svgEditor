import { AVAILABLE_SHAPES } from '../shapes/availableShapes';

/** A flattened property path (e.g. `x`, `style.fill`, `style.translate.0`, `points.2.1`) to its value. */
export type FLAT_STATE = Record<string, number | string>;

/** Changed properties of a shape: top-level keys, plus changed style keys under `style`. */
export type SHAPE_PATCH = { [key: string]: any, style?: { [key: string]: any } };

export type SHAPES_STATE = { [shapeId: string]: AVAILABLE_SHAPES };

export type TRANSITION = 'none' | 'fade' | 'zoom' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown';

/**
 * A snapshot of a timeline's shapes, stored relative to the previous cutscene in the same
 * timeline. During [start, end] the timeline animates from the previous cutscene's state to
 * this one: added shapes enter, removed shapes exit, changed shapes morph.
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
    /** the first cutscene of every timeline; it holds the timeline's starting shapes */
    isDefault?: boolean;
    /** shapes that appear in this cutscene, stored in full */
    added: SHAPES_STATE;
    /** changes to shapes that were already there */
    changed: { [shapeId: string]: SHAPE_PATCH };
    /** shapes that leave in this cutscene */
    removed: string[];
    /** entry animation per added shape */
    enter: { [shapeId: string]: TRANSITION };
    /** exit animation per removed shape */
    exit: { [shapeId: string]: TRANSITION };
}

/** A named row of cutscenes that owns its shapes. Cutscenes in one timeline never overlap. */
export interface TIMELINE_TRACK {
    id: string;
    name: string;
    cutscenes: CUTSCENE[];
}

export interface CLIP_REF {
    timelineId: string;
    id: string;
}

/** The cutscene loaded onto the canvas; canvas edits are saved into it. */
export interface EDITING {
    timelineId: string;
    cutsceneId: string;
    /** shapes of other timelines, shown for context but not editable */
    locked: string[];
}

export const MIN_ZOOM_SECONDS = 1;
export const MAX_ZOOM_SECONDS = 60;
export const MIN_CUTSCENE_DURATION = 0.1;
export const DEFAULT_CUTSCENE_DURATION = 1;
export const DEFAULT_EASE = 'power1.inOut';
export const DEFAULT_ENTER: TRANSITION = 'fade';
export const DEFAULT_EXIT: TRANSITION = 'fade';
/** how far slide entries / exits travel, in canvas units */
export const SLIDE_DISTANCE = 150;

export const EASES: Array<{ value: string, label: string }> = [
    { value: 'none', label: 'Linear' },
    { value: 'power1.inOut', label: 'Smooth' },
    { value: 'power2.in', label: 'Ease in' },
    { value: 'power2.out', label: 'Ease out' },
    { value: 'back.out(1.7)', label: 'Overshoot' },
    { value: 'elastic.out(1, 0.4)', label: 'Elastic' },
    { value: 'bounce.out', label: 'Bounce' },
];

export const TRANSITIONS: Array<{ value: TRANSITION, label: string }> = [
    { value: 'none', label: 'Appear' },
    { value: 'fade', label: 'Fade' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'slideLeft', label: 'Slide · left' },
    { value: 'slideRight', label: 'Slide · right' },
    { value: 'slideUp', label: 'Slide · up' },
    { value: 'slideDown', label: 'Slide · down' },
];
