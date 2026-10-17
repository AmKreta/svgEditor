import { cloneDeep, isEqual } from 'lodash';
import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import generateId from '../utils/idGenerator';
import {
    CUTSCENE, DEFAULT_CUTSCENE_DURATION, DEFAULT_EASE, DEFAULT_ENTER, DEFAULT_EXIT,
    SHAPES_STATE, SHAPE_PATCH, TIMELINE_TRACK, TRANSITION
} from './timeline.types';

export const DEFAULT_CUTSCENE_NAME = 'Start';

export function emptyCutscene(fields: Partial<CUTSCENE> & Pick<CUTSCENE, 'name' | 'start' | 'end'>): CUTSCENE {
    return { id: generateId(), ease: DEFAULT_EASE, added: {}, changed: {}, removed: [], enter: {}, exit: {}, ...fields };
}

/** A timeline with its default cutscene, which starts with `shapes` on screen. */
export function createTimeline(name: string, shapes: SHAPES_STATE = {}): TIMELINE_TRACK {
    const added = cloneDeep(shapes);
    const enter: { [id: string]: TRANSITION } = {};
    Object.keys(added).forEach(id => {
        enter[id] = 'none';
    });
    return {
        id: generateId(),
        name,
        cutscenes: [emptyCutscene({ name: DEFAULT_CUTSCENE_NAME, start: 0, end: DEFAULT_CUTSCENE_DURATION, isDefault: true, added, enter })],
    };
}

/** True when timelines use the snapshot format (older documents are migrated). */
export function isSnapshotFormat(timelines: unknown): timelines is TIMELINE_TRACK[] {
    return Array.isArray(timelines) && timelines.length > 0 && timelines.every((t: any) =>
        Array.isArray(t.cutscenes) && t.cutscenes.length > 0 && t.cutscenes[0].isDefault &&
        t.cutscenes.every((c: any) => c.added && c.changed && Array.isArray(c.removed))
    );
}

/** Before a page's timelines are created: one empty timeline. */
export const DEFAULT_TIMELINES: TIMELINE_TRACK[] = [{
    id: 'timeline-1',
    name: 'Timeline 1',
    cutscenes: [{ ...emptyCutscene({ name: DEFAULT_CUTSCENE_NAME, start: 0, end: DEFAULT_CUTSCENE_DURATION, isDefault: true }), id: 'timeline-1-start' }],
}];

/** The default cutscene first, then the rest by start time. */
export function orderedCutscenes(track: TIMELINE_TRACK): CUTSCENE[] {
    return [...track.cutscenes].sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)) || a.start - b.start);
}

export function applyPatch(shape: AVAILABLE_SHAPES, patch: SHAPE_PATCH): AVAILABLE_SHAPES {
    const { style, ...rest } = patch;
    return { ...shape, ...cloneDeep(rest), style: { ...shape.style, ...cloneDeep(style || {}) } } as AVAILABLE_SHAPES;
}

export function applyCutscene(previous: SHAPES_STATE, cutscene: CUTSCENE): SHAPES_STATE {
    const next: SHAPES_STATE = { ...previous };
    cutscene.removed.forEach(id => delete next[id]);
    Object.keys(cutscene.added).forEach(id => {
        next[id] = cloneDeep(cutscene.added[id]);
    });
    Object.keys(cutscene.changed).forEach(id => {
        if (next[id]) {
            next[id] = applyPatch(next[id], cutscene.changed[id]);
        }
    });
    return next;
}

export interface RESOLVED {
    cutscene: CUTSCENE;
    /** all of the timeline's shapes once this cutscene has finished */
    state: SHAPES_STATE;
}

/** Each cutscene with the full state it reaches, built from the previous one. */
export function resolveTimeline(track: TIMELINE_TRACK): RESOLVED[] {
    let state: SHAPES_STATE = {};
    return orderedCutscenes(track).map(cutscene => {
        state = applyCutscene(state, cutscene);
        return { cutscene, state };
    });
}

/** Changed properties between two versions of a shape, or null when nothing changed. */
export function diffShape(before: AVAILABLE_SHAPES, after: AVAILABLE_SHAPES): SHAPE_PATCH | null {
    const patch: SHAPE_PATCH = {};
    const b = before as any;
    const a = after as any;
    new Set([...Object.keys(b), ...Object.keys(a)]).forEach(key => {
        if (key === 'style' || key === 'id' || key === 'pageId') {
            return;
        }
        if (!isEqual(b[key], a[key])) {
            patch[key] = cloneDeep(a[key]);
        }
    });
    const style: { [key: string]: any } = {};
    new Set([...Object.keys(b.style || {}), ...Object.keys(a.style || {})]).forEach(key => {
        if (!isEqual(b.style?.[key], a.style?.[key])) {
            style[key] = cloneDeep(a.style?.[key]);
        }
    });
    if (Object.keys(style).length) {
        patch.style = style;
    }
    return Object.keys(patch).length ? patch : null;
}

/** Stores `current` as the cutscene that follows `previous`, keeping chosen entry/exit animations. */
export function snapshotInto(cutscene: CUTSCENE, previous: SHAPES_STATE, current: SHAPES_STATE): CUTSCENE {
    const added: SHAPES_STATE = {};
    const changed: CUTSCENE['changed'] = {};
    const enter: CUTSCENE['enter'] = {};
    const exit: CUTSCENE['exit'] = {};
    Object.keys(current).forEach(id => {
        if (!previous[id]) {
            added[id] = cloneDeep(current[id]);
            enter[id] = cutscene.enter[id] || (cutscene.isDefault ? 'none' : DEFAULT_ENTER);
            return;
        }
        const patch = diffShape(previous[id], current[id]);
        if (patch) {
            changed[id] = patch;
        }
    });
    const removed = Object.keys(previous).filter(id => !current[id]);
    removed.forEach(id => {
        exit[id] = cutscene.exit[id] || DEFAULT_EXIT;
    });
    return { ...cutscene, added, changed, removed, enter, exit };
}

/** Which timeline each shape belongs to (the one it was added in). */
export function shapeOwners(timelines: TIMELINE_TRACK[]): { [shapeId: string]: string } {
    const owners: { [shapeId: string]: string } = {};
    timelines.forEach(track => track.cutscenes.forEach(c => Object.keys(c.added).forEach(id => {
        owners[id] = track.id;
    })));
    return owners;
}

export function findCutscene(timelines: TIMELINE_TRACK[], timelineId: string, cutsceneId: string) {
    return timelines.find(t => t.id === timelineId)?.cutscenes.find(c => c.id === cutsceneId) || null;
}

/** Full state of a timeline before and after one of its cutscenes. */
export function cutsceneStates(track: TIMELINE_TRACK, cutsceneId: string): { before: SHAPES_STATE, after: SHAPES_STATE } | null {
    const resolved = resolveTimeline(track);
    const index = resolved.findIndex(r => r.cutscene.id === cutsceneId);
    if (index === -1) {
        return null;
    }
    return { before: index > 0 ? resolved[index - 1].state : {}, after: resolved[index].state };
}
