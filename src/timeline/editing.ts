import { isEqual } from 'lodash';
import store from '../store/store';
import { formatActiveShape, setPageTimelines } from '../actions/pages/pages.actions';
import { setEditing, setPlayback } from '../actions/timeline/timeline.actions';
import { getPageTimelines, getShapesOfCurrentPage } from '../selector/selector';
import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { applyFlatState, diffFlatState, flattenShape } from './animatable';
import { timelinePlayer } from './player';
import { cutsceneBaseline, findCutscene } from './model';
import { updateClip } from './clipOps';
import { CLIP_REF, FLAT_STATE } from './timeline.types';

// each shape's animatable state as of the last sync; only properties that change after this
// are written into the cutscene, so selecting a cutscene never rewrites what it already stores
let lastSeen: { [shapeId: string]: FLAT_STATE } = {};

const sameValue = (a: number | string | undefined, b: number | string | undefined) =>
    typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-6 : a === b;

function writeFlat(shape: AVAILABLE_SHAPES, flat: FLAT_STATE) {
    if (!isEqual(flattenShape(shape), flat)) {
        store.dispatch(formatActiveShape({ id: shape.id, properties: applyFlatState(shape, flat) as any }));
    }
}

/** Shows the page as it looks at `time`; at 0 (or with no animation) the shapes themselves are shown. */
export function showTimeOnCanvas(time: number) {
    const state = store.getState();
    timelinePlayer.sync(getPageTimelines(state), getShapesOfCurrentPage(state));
    const preview = time > 0 && !timelinePlayer.isEmpty ? timelinePlayer.evaluate(time) : null;
    store.dispatch(setPlayback({ time, preview }));
}

/**
 * Selecting a cutscene: the canvas shows every shape as it is when the cutscene ends and
 * stays editable. Shape edits from then on are saved into the cutscene by `syncEditedCutscene`.
 */
export function enterCutscene(ref: CLIP_REF) {
    exitCutscene(false);
    timelinePlayer.pause();
    const state = store.getState();
    const timelines = getPageTimelines(state);
    const cutscene = findCutscene(timelines, ref.timelineId, ref.id);
    if (!cutscene) {
        return;
    }
    const shapes = getShapesOfCurrentPage(state);
    const { from, to } = cutsceneBaseline(timelines, shapes, ref.id);
    const backup: { [id: string]: FLAT_STATE } = {};
    Object.keys(shapes).forEach(id => {
        backup[id] = flattenShape(shapes[id]);
    });

    lastSeen = to;
    store.dispatch(setPlayback({ time: cutscene.end, playing: false, preview: null }));
    store.dispatch(setEditing({ timelineId: ref.timelineId, cutsceneId: ref.id, backup, from }));
    Object.keys(shapes).forEach(id => writeFlat(shapes[id], to[id]));
}

/**
 * Saves shape edits into the selected cutscene. A property edited back to its value at the
 * cutscene's start stops being animated; properties nobody touched keep what's stored.
 */
export function syncEditedCutscene() {
    const state = store.getState();
    const editing = state.timeline.editing;
    if (!editing) {
        return;
    }
    const timelines = getPageTimelines(state);
    const cutscene = findCutscene(timelines, editing.timelineId, editing.cutsceneId);
    if (!cutscene) {
        return;
    }
    const shapes = getShapesOfCurrentPage(state);
    const next = { ...cutscene.state };
    let changed = false;

    Object.keys(editing.from).forEach(id => {
        // shapes created while editing aren't animated
        if (!shapes[id]) {
            if (next[id]) {
                delete next[id];
                changed = true;
            }
            return;
        }
        const current = flattenShape(shapes[id]);
        const seen = lastSeen[id] || current;
        const edited = Object.keys(current).filter(key => !sameValue(current[key], seen[key]));
        lastSeen[id] = current;
        if (!edited.length) {
            return;
        }
        const from = editing.from[id];
        const target = { ...(next[id] || {}) };
        edited.forEach(key => {
            if (!(key in from) || sameValue(current[key], from[key])) {
                delete target[key];
            } else {
                target[key] = diffFlatState({ [key]: from[key] }, { [key]: current[key] })[key];
            }
        });
        if (Object.keys(target).length) {
            next[id] = target;
        } else {
            delete next[id];
        }
        changed = true;
    });

    if (changed && !isEqual(next, cutscene.state)) {
        store.dispatch(setPageTimelines(updateClip(timelines, { timelineId: editing.timelineId, id: editing.cutsceneId }, { state: next })));
    }
}

/** Leaves cutscene editing and puts the shapes' own animatable properties back. */
export function exitCutscene(refresh = true) {
    const state = store.getState();
    const editing = state.timeline.editing;
    if (!editing) {
        return;
    }
    syncEditedCutscene();
    // leave editing first so restoring the shapes isn't saved into the cutscene
    store.dispatch(setEditing(null));
    const shapes = getShapesOfCurrentPage(store.getState());
    Object.keys(editing.backup).forEach(id => {
        // only animatable properties are restored, so e.g. a rename while editing is kept
        shapes[id] && writeFlat(shapes[id], editing.backup[id]);
    });
    if (refresh) {
        showTimeOnCanvas(store.getState().timeline.time);
    }
}

/**
 * Stops the selected cutscene animating `keys` of a shape (all of them when omitted) and puts
 * those properties back to how they are when the cutscene starts.
 */
export function revertInCutscene(shapeId: string, keys?: string[]) {
    const state = store.getState();
    const editing = state.timeline.editing;
    const shape = getShapesOfCurrentPage(state)[shapeId];
    const timelines = getPageTimelines(state);
    const cutscene = editing && findCutscene(timelines, editing.timelineId, editing.cutsceneId);
    if (!editing || !cutscene || !shape || !editing.from[shapeId]) {
        return;
    }
    const nextState = { ...cutscene.state };
    const target = { ...(nextState[shapeId] || {}) };
    (keys || Object.keys(target)).forEach(key => delete target[key]);
    if (Object.keys(target).length) {
        nextState[shapeId] = target;
    } else {
        delete nextState[shapeId];
    }
    store.dispatch(setPageTimelines(updateClip(timelines, { timelineId: editing.timelineId, id: editing.cutsceneId }, { state: nextState })));

    const from = editing.from[shapeId];
    const next = { ...flattenShape(shape) };
    (keys || Object.keys(from)).forEach(key => {
        if (key in from) {
            next[key] = from[key];
        }
    });
    writeFlat(shape, next);
}

/**
 * Watches shape edits: while a cutscene is selected they're saved into it, and while a paused
 * preview is showing it's refreshed. Reducers update shapes inside the same object, so changes
 * are detected by comparing each shape. Returns the unsubscribe function.
 */
export function watchShapeEdits(): () => void {
    let lastShapes: AVAILABLE_SHAPES[] = [];
    return store.subscribe(() => {
        const state = store.getState();
        const shapes = Object.values(getShapesOfCurrentPage(state));
        const changed = shapes.length !== lastShapes.length || shapes.some((shape, i) => shape !== lastShapes[i]);
        if (!changed) {
            return;
        }
        lastShapes = shapes;
        const { editing, playing, time } = state.timeline;
        if (editing) {
            syncEditedCutscene();
        } else if (!playing && time > 0) {
            showTimeOnCanvas(time);
        }
    });
}
