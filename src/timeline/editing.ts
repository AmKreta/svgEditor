import { cloneDeep, isEqual } from 'lodash';
import store from '../store/store';
import { setPageShapes, setPageTimelines } from '../actions/pages/pages.actions';
import { setEditing, setPlayback } from '../actions/timeline/timeline.actions';
import { getPageTimelines, getShapesOfCurrentPage } from '../selector/selector';
import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { timelinePlayer } from './player';
import { applyPatch, cutsceneStates, findCutscene, shapeOwners, snapshotInto } from './model';
import { updateClip } from './clipOps';
import { CLIP_REF, SHAPES_STATE, SHAPE_PATCH, TRANSITION } from './timeline.types';

// shapes exactly as a cutscene was loaded; nothing is saved until they change
let loadedShapes: AVAILABLE_SHAPES[] = [];

const sameShapes = (a: AVAILABLE_SHAPES[], b: AVAILABLE_SHAPES[]) =>
    a.length === b.length && a.every((shape, i) => shape === b[i]);

/** Shows the page as it looks at `time`, view-only. */
export function showTimeOnCanvas(time: number) {
    timelinePlayer.sync(getPageTimelines(store.getState()));
    store.dispatch(setPlayback({ time, preview: timelinePlayer.evaluate(time) }));
}

/**
 * Loads a cutscene onto the canvas: its timeline's shapes as they are when it ends, plus the
 * other timelines' shapes at that moment (locked). Canvas edits are then saved into it.
 */
export function enterCutscene(ref: CLIP_REF) {
    timelinePlayer.pause();
    const timelines = getPageTimelines(store.getState());
    const track = timelines.find(t => t.id === ref.timelineId);
    const cutscene = findCutscene(timelines, ref.timelineId, ref.id);
    const states = track && cutsceneStates(track, ref.id);
    if (!track || !cutscene || !states) {
        return;
    }
    timelinePlayer.sync(timelines);
    const owners = shapeOwners(timelines);
    const others: SHAPES_STATE = {};
    const atEnd = timelinePlayer.evaluate(cutscene.end);
    Object.keys(atEnd).forEach(id => {
        if (owners[id] !== track.id) {
            others[id] = atEnd[id];
        }
    });

    // keep the timelines' drawing order: earlier timelines are drawn first (further back)
    const working: SHAPES_STATE = {};
    timelines.forEach(t => {
        if (t.id === track.id) {
            Object.assign(working, cloneDeep(states.after));
        } else {
            Object.keys(others).forEach(id => {
                if (owners[id] === t.id) {
                    working[id] = others[id];
                }
            });
        }
    });
    loadedShapes = Object.values(working);
    store.dispatch(setPlayback({ time: cutscene.end, playing: false, preview: null }));
    store.dispatch(setEditing({ timelineId: track.id, cutsceneId: cutscene.id, locked: Object.keys(others) }));
    store.dispatch(setPageShapes(working));
}

/** Saves the canvas into the cutscene being edited, as changes from the previous cutscene. */
export function syncEditedCutscene() {
    const state = store.getState();
    const editing = state.timeline.editing;
    if (!editing) {
        return;
    }
    const shapes = getShapesOfCurrentPage(state);
    if (sameShapes(Object.values(shapes), loadedShapes)) {
        return;
    }
    const timelines = getPageTimelines(state);
    const track = timelines.find(t => t.id === editing.timelineId);
    const cutscene = findCutscene(timelines, editing.timelineId, editing.cutsceneId);
    const states = track && cutsceneStates(track, editing.cutsceneId);
    if (!cutscene || !states) {
        return;
    }
    const locked = new Set(editing.locked);
    const current: SHAPES_STATE = {};
    Object.keys(shapes).forEach(id => {
        if (!locked.has(id)) {
            current[id] = shapes[id];
        }
    });
    const next = snapshotInto(cutscene, states.before, current);
    if (!isEqual(next, cutscene)) {
        store.dispatch(setPageTimelines(updateClip(timelines, { timelineId: editing.timelineId, id: cutscene.id }, next)));
    }
}

/** Leaves cutscene editing; the canvas goes back to a view-only preview. */
export function exitCutscene(refresh = true) {
    if (!store.getState().timeline.editing) {
        return;
    }
    syncEditedCutscene();
    store.dispatch(setEditing(null));
    if (refresh) {
        showTimeOnCanvas(store.getState().timeline.time);
    }
}

function editedCutscene() {
    const state = store.getState();
    const editing = state.timeline.editing;
    if (!editing) {
        return null;
    }
    const timelines = getPageTimelines(state);
    const track = timelines.find(t => t.id === editing.timelineId);
    const cutscene = findCutscene(timelines, editing.timelineId, editing.cutsceneId);
    const states = track && cutsceneStates(track, editing.cutsceneId);
    return cutscene && states ? { editing, timelines, cutscene, states, shapes: getShapesOfCurrentPage(state) } : null;
}

/**
 * Undoes part of what the edited cutscene does to a shape: takes an entering shape back out,
 * brings an exiting shape back, or puts `keys` (all when omitted) of a changed shape back to
 * the previous cutscene's values.
 */
export function revertInCutscene(shapeId: string, keys?: string[]) {
    const context = editedCutscene();
    if (!context) {
        return;
    }
    const { states, shapes } = context;
    const before = states.before[shapeId];
    const current = shapes[shapeId];
    const next = { ...shapes };
    if (!before) {
        delete next[shapeId];
    } else if (!current || !keys) {
        next[shapeId] = cloneDeep(before);
    } else {
        const patch: SHAPE_PATCH = {};
        keys.forEach(key => {
            if (key.startsWith('style.')) {
                patch.style = { ...(patch.style || {}), [key.slice(6)]: (before.style as any)[key.slice(6)] };
            } else {
                patch[key] = (before as any)[key];
            }
        });
        next[shapeId] = applyPatch(current, patch);
    }
    store.dispatch(setPageShapes(next));
}

/** Picks the entry or exit animation of a shape in the edited cutscene. */
export function setTransition(shapeId: string, kind: 'enter' | 'exit', type: TRANSITION) {
    const context = editedCutscene();
    if (!context) {
        return;
    }
    const { editing, timelines, cutscene } = context;
    store.dispatch(setPageTimelines(updateClip(
        timelines,
        { timelineId: editing.timelineId, id: cutscene.id },
        { [kind]: { ...cutscene[kind], [shapeId]: type } }
    )));
}

/**
 * Saves canvas edits into the selected cutscene as they happen. Reducers update shapes inside
 * the same object, so changes are detected by comparing each shape. Returns the unsubscribe.
 */
export function watchShapeEdits(): () => void {
    let last: AVAILABLE_SHAPES[] = [];
    return store.subscribe(() => {
        const state = store.getState();
        const shapes = Object.values(getShapesOfCurrentPage(state));
        if (sameShapes(shapes, last)) {
            return;
        }
        last = shapes;
        if (state.timeline.editing) {
            syncEditedCutscene();
        }
    });
}
