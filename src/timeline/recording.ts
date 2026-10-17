import { cloneDeep } from 'lodash';
import store from '../store/store';
import { formatActiveShape, setPageTimeline } from '../actions/pages/pages.actions';
import { setPlayback, setRecording } from '../actions/timeline/timeline.actions';
import { getPageTimeline, getShapesOfCurrentPage } from '../selector/selector';
import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import generateId from '../utils/idGenerator';
import { diffFlatState, flattenShape } from './animatable';
import { timelinePlayer } from './player';
import { roundTime } from './clipOps';
import { CUTSCENE, DEFAULT_CUTSCENE_DURATION, DEFAULT_EASE, FLAT_STATE, MIN_CUTSCENE_DURATION, TIMELINE } from './timeline.types';

const TIME_EPSILON = 1e-3;

function replaceShape(shape: AVAILABLE_SHAPES) {
    store.dispatch(formatActiveShape({ id: shape.id, properties: shape as any }));
}

/** Shows the page as it looks at `time` (or the editable start state at 0). */
export function showTimeOnCanvas(time: number) {
    const state = store.getState();
    timelinePlayer.sync(getPageTimeline(state), getShapesOfCurrentPage(state));
    const preview = time > 0 && !timelinePlayer.isEmpty ? timelinePlayer.evaluate(time) : null;
    store.dispatch(setPlayback({ time, preview }));
}

/**
 * Snapshot mode: the canvas switches to the page as it looks at the playhead and
 * becomes editable. Whatever changes before `commitRecording` becomes animation.
 */
export function startRecording() {
    timelinePlayer.pause();
    let time = store.getState().timeline.time;
    if (time < MIN_CUTSCENE_DURATION) {
        // a snapshot at 0 would have no room for a cutscene before it
        time = DEFAULT_CUTSCENE_DURATION;
    }
    const state = store.getState();
    const shapes = getShapesOfCurrentPage(state);
    timelinePlayer.sync(getPageTimeline(state), shapes);
    const atTime = timelinePlayer.isEmpty ? {} : timelinePlayer.evaluate(time);

    const backup: { [id: string]: AVAILABLE_SHAPES } = {};
    const stateAtTime: { [id: string]: FLAT_STATE } = {};
    Object.keys(shapes).forEach(id => {
        backup[id] = cloneDeep(shapes[id]);
        stateAtTime[id] = flattenShape(atTime[id] || shapes[id]);
    });

    store.dispatch(setPlayback({ time, playing: false, preview: null }));
    store.dispatch(setRecording({ time, backup, stateAtTime }));
    // put every animated shape into its state at the playhead so it can be edited directly
    Object.values(atTime).forEach(replaceShape);
}

/** Adds `diff` to the row so the shape reaches it at `time`. */
function addSnapshotToRow(cutscenes: CUTSCENE[], time: number, diff: FLAT_STATE): CUTSCENE[] {
    const sorted = [...cutscenes].sort((a, b) => a.start - b.start);
    // a cutscene ending at the playhead, or one the playhead is inside, takes the change
    const target = sorted.find(c => Math.abs(c.end - time) < TIME_EPSILON)
        || sorted.find(c => c.start < time && time < c.end);
    if (target) {
        return sorted.map(c => c === target ? { ...c, state: { ...c.state, ...diff } } : c);
    }
    const previousEnd = Math.max(0, ...sorted.filter(c => c.end <= time).map(c => c.end));
    const start = roundTime(Math.max(previousEnd, time - DEFAULT_CUTSCENE_DURATION));
    if (time - start < MIN_CUTSCENE_DURATION) {
        const previous = sorted.filter(c => c.end <= time).pop();
        if (previous) {
            return sorted.map(c => c === previous ? { ...c, state: { ...c.state, ...diff } } : c);
        }
    }
    return [...sorted, { id: generateId(), start, end: roundTime(Math.max(time, start + MIN_CUTSCENE_DURATION)), ease: DEFAULT_EASE, state: diff }];
}

function restore(backup: { [id: string]: AVAILABLE_SHAPES }) {
    const current = getShapesOfCurrentPage(store.getState());
    Object.keys(backup).forEach(id => {
        // shapes deleted while recording stay deleted
        current[id] && replaceShape(backup[id]);
    });
}

/** Turns everything changed since `startRecording` into cutscenes, then restores the start state. */
export function commitRecording(): number {
    const state = store.getState();
    const recording = state.timeline.recording;
    if (!recording) {
        return 0;
    }
    const shapes = getShapesOfCurrentPage(state);
    const timeline: TIMELINE = { ...getPageTimeline(state) };
    let changedShapes = 0;

    Object.keys(recording.backup).forEach(id => {
        const shape = shapes[id];
        if (!shape || !shape.render) {
            return;
        }
        const diff = diffFlatState(recording.stateAtTime[id], flattenShape(shape));
        if (!Object.keys(diff).length) {
            return;
        }
        changedShapes++;
        timeline[id] = { cutscenes: addSnapshotToRow(timeline[id]?.cutscenes || [], recording.time, diff) };
    });

    restore(recording.backup);
    store.dispatch(setPageTimeline(timeline));
    store.dispatch(setRecording(null));
    showTimeOnCanvas(recording.time);
    return changedShapes;
}

export function cancelRecording() {
    const recording = store.getState().timeline.recording;
    if (!recording) {
        return;
    }
    restore(recording.backup);
    store.dispatch(setRecording(null));
    showTimeOnCanvas(recording.time);
}
