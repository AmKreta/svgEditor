import generateId from '../utils/idGenerator';
import { cloneDeep } from 'lodash';
import { emptyCutscene } from './model';
import { CLIP_REF, CUTSCENE, DEFAULT_CUTSCENE_DURATION, MIN_CUTSCENE_DURATION, TIMELINE_TRACK } from './timeline.types';

export interface CLIPBOARD_ITEM {
    timelineId: string;
    cutscene: CUTSCENE;
}

export type TIME_DRAFT = { [clipId: string]: { start: number, end: number } };
type TRACKS = TIMELINE_TRACK[];

export const roundTime = (t: number) => Math.round(t * 100) / 100;

const cutscenesOf = (tracks: TRACKS, timelineId: string) => tracks.find(t => t.id === timelineId)?.cutscenes || [];

const mapTrack = (tracks: TRACKS, timelineId: string, fn: (cutscenes: CUTSCENE[]) => CUTSCENE[]): TRACKS =>
    tracks.map(t => t.id === timelineId ? { ...t, cutscenes: fn(t.cutscenes) } : t);

export const cloneCutscene = (cutscene: CUTSCENE): CUTSCENE => cloneDeep(cutscene);

/**
 * A pasted cutscene can't reuse the ids of the shapes it adds (they already exist), so those
 * shapes get new ids; changes and removals still refer to the destination timeline's shapes.
 */
function withFreshShapeIds(cutscene: CUTSCENE): CUTSCENE {
    const ids: { [oldId: string]: string } = {};
    Object.keys(cutscene.added).forEach(id => {
        ids[id] = generateId();
    });
    const rename = (id: string) => ids[id] || id;
    const added: CUTSCENE['added'] = {};
    Object.keys(cutscene.added).forEach(id => {
        const shape: any = { ...cloneDeep(cutscene.added[id]), id: rename(id) };
        if (Array.isArray(shape.children)) {
            shape.children = shape.children.map(rename);
        }
        added[rename(id)] = shape;
    });
    const enter: CUTSCENE['enter'] = {};
    Object.keys(cutscene.enter).forEach(id => {
        enter[rename(id)] = cutscene.enter[id];
    });
    return { ...cloneDeep(cutscene), isDefault: undefined, added, enter };
}

export function findClips(tracks: TRACKS, refs: CLIP_REF[]): CLIPBOARD_ITEM[] {
    return refs
        .map(ref => ({ timelineId: ref.timelineId, cutscene: cutscenesOf(tracks, ref.timelineId).find(c => c.id === ref.id) }))
        .filter((item): item is CLIPBOARD_ITEM => Boolean(item.cutscene));
}

export function nextCutsceneName(tracks: TRACKS) {
    const used = new Set(tracks.flatMap(t => t.cutscenes.map(c => c.name)));
    // the default "Start" cutscenes don't count
    let n = tracks.reduce((sum, t) => sum + t.cutscenes.filter(c => !c.isDefault).length, 0) + 1;
    while (used.has(`Cutscene ${n}`)) n++;
    return `Cutscene ${n}`;
}

export function nextTimelineName(tracks: TRACKS) {
    const used = new Set(tracks.map(t => t.name));
    let n = tracks.length + 1;
    while (used.has(`Timeline ${n}`)) n++;
    return `Timeline ${n}`;
}

/** Appends a 1 second cutscene after the last one in the timeline. */
export function addCutscene(tracks: TRACKS, timelineId: string): { tracks: TRACKS, ref: CLIP_REF } {
    const start = Math.max(0, ...cutscenesOf(tracks, timelineId).map(c => c.end));
    const cutscene = emptyCutscene({
        name: nextCutsceneName(tracks),
        start: roundTime(start),
        end: roundTime(start + DEFAULT_CUTSCENE_DURATION),
    });
    return {
        tracks: mapTrack(tracks, timelineId, cutscenes => [...cutscenes, cutscene]),
        ref: { timelineId, id: cutscene.id },
    };
}

/** Removes cutscenes; a timeline's default cutscene always stays. */
export function removeClips(tracks: TRACKS, refs: CLIP_REF[]): TRACKS {
    const ids = new Set(refs.map(ref => ref.id));
    return tracks.map(t => ({ ...t, cutscenes: t.cutscenes.filter(c => c.isDefault || !ids.has(c.id)) }));
}

export function updateClip(tracks: TRACKS, ref: CLIP_REF, patch: Partial<CUTSCENE>): TRACKS {
    return mapTrack(tracks, ref.timelineId, cutscenes => cutscenes.map(c => c.id === ref.id ? { ...c, ...patch } : c));
}

export function applyDraft(tracks: TRACKS, draft: TIME_DRAFT): TRACKS {
    return tracks.map(t => ({ ...t, cutscenes: t.cutscenes.map(c => draft[c.id] ? { ...c, ...draft[c.id] } : c) }));
}

/** How far the given clips can move together without crossing 0 or a clip that isn't moving. */
export function moveLimits(tracks: TRACKS, refs: CLIP_REF[]): [number, number] {
    const moving = new Set(refs.map(ref => ref.id));
    let lo = -Infinity;
    let hi = Infinity;
    findClips(tracks, refs).forEach(({ timelineId, cutscene }) => {
        if (cutscene.isDefault) {
            // the default cutscene always starts the timeline
            lo = Math.max(lo, 0);
            hi = Math.min(hi, 0);
            return;
        }
        const others = cutscenesOf(tracks, timelineId).filter(c => !moving.has(c.id));
        const previousEnd = Math.max(0, ...others.filter(c => c.end <= cutscene.start + 1e-6).map(c => c.end));
        const nextStart = Math.min(Infinity, ...others.filter(c => c.start >= cutscene.end - 1e-6).map(c => c.start));
        lo = Math.max(lo, previousEnd - cutscene.start);
        hi = Math.min(hi, nextStart - cutscene.end);
    });
    return [lo, hi];
}

/** Allowed range for one edge of a clip while resizing. */
export function edgeLimits(tracks: TRACKS, ref: CLIP_REF, edge: 'start' | 'end'): [number, number] {
    const clip = findClips(tracks, [ref])[0]?.cutscene;
    if (!clip) {
        return [0, 0];
    }
    const others = cutscenesOf(tracks, ref.timelineId).filter(c => c.id !== ref.id);
    if (edge === 'start') {
        if (clip.isDefault) {
            return [0, 0];
        }
        const previousEnd = Math.max(0, ...others.filter(c => c.end <= clip.start + 1e-6).map(c => c.end));
        return [previousEnd, clip.end - MIN_CUTSCENE_DURATION];
    }
    const nextStart = Math.min(Infinity, ...others.filter(c => c.start >= clip.end - 1e-6).map(c => c.start));
    return [clip.start + MIN_CUTSCENE_DURATION, nextStart];
}

/** Clip edges other than the given clips', used for snapping. */
export function snapEdges(tracks: TRACKS, excludeIds: Set<string>): number[] {
    const edges: number[] = [0];
    tracks.forEach(t => t.cutscenes.forEach(c => {
        if (!excludeIds.has(c.id)) {
            edges.push(c.start, c.end);
        }
    }));
    return edges;
}

const overlaps = (a: { start: number, end: number }, b: { start: number, end: number }) =>
    a.start < b.end - 1e-6 && b.start < a.end - 1e-6;

/**
 * Inserts copies of `items`, keeping their relative timing, with the earliest one at `at`.
 * `trackFor` picks each copy's timeline (or null to skip it). Copies that would overlap
 * existing cutscenes are pushed later until they fit.
 */
export function pasteClips(
    tracks: TRACKS,
    items: CLIPBOARD_ITEM[],
    at: number,
    trackFor: (item: CLIPBOARD_ITEM) => string | null
): { tracks: TRACKS, pasted: CLIP_REF[] } {
    const placed = items
        .map(item => ({ timelineId: trackFor(item), cutscene: item.cutscene }))
        .filter((item): item is CLIPBOARD_ITEM => Boolean(item.timelineId) && tracks.some(t => t.id === item.timelineId));
    if (!placed.length) {
        return { tracks, pasted: [] };
    }
    const earliest = Math.min(...placed.map(item => item.cutscene.start));
    let copies = placed
        .sort((a, b) => a.cutscene.start - b.cutscene.start)
        .map(item => ({
            timelineId: item.timelineId,
            cutscene: {
                ...withFreshShapeIds(item.cutscene),
                id: generateId(),
                name: `${item.cutscene.name} copy`,
                start: roundTime(item.cutscene.start - earliest + at),
                end: roundTime(item.cutscene.end - earliest + at),
            }
        }));

    // copies landing in the same timeline are laid end to end
    const lastEndByTrack: { [id: string]: number } = {};
    copies = copies.map(item => {
        const lastEnd = lastEndByTrack[item.timelineId];
        let { start, end } = item.cutscene;
        if (lastEnd !== undefined && start < lastEnd) {
            end = roundTime(end + lastEnd - start);
            start = lastEnd;
        }
        lastEndByTrack[item.timelineId] = end;
        return { ...item, cutscene: { ...item.cutscene, start, end } };
    });

    // push the whole group later until nothing overlaps the existing cutscenes
    for (let guard = 0; guard < 100; guard++) {
        let shift = 0;
        copies.forEach(item => {
            cutscenesOf(tracks, item.timelineId).forEach(existing => {
                if (overlaps(existing, item.cutscene)) {
                    shift = Math.max(shift, existing.end - item.cutscene.start);
                }
            });
        });
        if (shift <= 0) {
            break;
        }
        copies = copies.map(item => ({
            ...item,
            cutscene: { ...item.cutscene, start: roundTime(item.cutscene.start + shift), end: roundTime(item.cutscene.end + shift) }
        }));
    }

    let next = tracks;
    copies.forEach(item => {
        next = mapTrack(next, item.timelineId, cutscenes => [...cutscenes, item.cutscene]);
    });
    return { tracks: next, pasted: copies.map(item => ({ timelineId: item.timelineId, id: item.cutscene.id })) };
}
