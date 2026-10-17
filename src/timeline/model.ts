import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { flattenShape } from './animatable';
import { CUTSCENE, FLAT_STATE, TIMELINE_TRACK } from './timeline.types';

/** Every page starts with one empty, renameable timeline. */
export const DEFAULT_TIMELINES: TIMELINE_TRACK[] = [{ id: 'timeline-1', name: 'Timeline 1', cutscenes: [] }];

/**
 * All cutscenes in the order they apply: by start time, then timeline, then position.
 * The player and the editor both use this so they agree on what a shape looks like.
 */
export function orderedCutscenes(timelines: TIMELINE_TRACK[]): CUTSCENE[] {
    return timelines
        .flatMap((track, trackIndex) => track.cutscenes.map((cutscene, index) => ({ cutscene, trackIndex, index })))
        .sort((a, b) => a.cutscene.start - b.cutscene.start || a.trackIndex - b.trackIndex || a.index - b.index)
        .map(entry => entry.cutscene);
}

/** Values a cutscene sets for one shape, limited to properties the shape actually has. */
export function targetFor(cutscene: CUTSCENE, shapeId: string, base: FLAT_STATE): FLAT_STATE {
    const target: FLAT_STATE = {};
    const state = cutscene.state[shapeId] || {};
    Object.keys(state).forEach(key => {
        if (key in base) {
            target[key] = state[key];
        }
    });
    return target;
}

/**
 * Each shape's state when `cutsceneId` starts (`from`) and when it ends (`to`),
 * ignoring cutscenes that start later.
 */
export function cutsceneBaseline(
    timelines: TIMELINE_TRACK[],
    shapes: { [id: string]: AVAILABLE_SHAPES },
    cutsceneId: string
): { from: { [id: string]: FLAT_STATE }, to: { [id: string]: FLAT_STATE } } {
    const ordered = orderedCutscenes(timelines);
    const position = ordered.findIndex(c => c.id === cutsceneId);
    const before = position === -1 ? ordered : ordered.slice(0, position);
    const cutscene = ordered[position];
    const from: { [id: string]: FLAT_STATE } = {};
    const to: { [id: string]: FLAT_STATE } = {};

    Object.keys(shapes).forEach(id => {
        const base = flattenShape(shapes[id]);
        let current = { ...base };
        before.forEach(c => {
            current = { ...current, ...targetFor(c, id, base) };
        });
        from[id] = current;
        to[id] = cutscene ? { ...current, ...targetFor(cutscene, id, base) } : current;
    });
    return { from, to };
}

export function findCutscene(timelines: TIMELINE_TRACK[], timelineId: string, cutsceneId: string) {
    return timelines.find(t => t.id === timelineId)?.cutscenes.find(c => c.id === cutsceneId) || null;
}
