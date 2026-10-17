import generateId from '../utils/idGenerator';
import { CUTSCENE, MIN_CUTSCENE_DURATION, TIMELINE } from './timeline.types';

export interface CLIP_REF {
    shapeId: string;
    id: string;
}

export interface CLIPBOARD_ITEM {
    shapeId: string;
    cutscene: CUTSCENE;
}

export type TIME_DRAFT = { [clipId: string]: { start: number, end: number } };

export const roundTime = (t: number) => Math.round(t * 100) / 100;

const rowOf = (timeline: TIMELINE, shapeId: string) => timeline[shapeId]?.cutscenes || [];

export function findClips(timeline: TIMELINE, refs: CLIP_REF[]): CLIPBOARD_ITEM[] {
    return refs
        .map(ref => ({ shapeId: ref.shapeId, cutscene: rowOf(timeline, ref.shapeId).find(c => c.id === ref.id) }))
        .filter((item): item is CLIPBOARD_ITEM => Boolean(item.cutscene));
}

export function removeClips(timeline: TIMELINE, refs: CLIP_REF[]): TIMELINE {
    const ids = new Set(refs.map(ref => ref.id));
    const next: TIMELINE = { ...timeline };
    new Set(refs.map(ref => ref.shapeId)).forEach(shapeId => {
        next[shapeId] = { cutscenes: rowOf(timeline, shapeId).filter(c => !ids.has(c.id)) };
    });
    return next;
}

export function updateClip(timeline: TIMELINE, ref: CLIP_REF, patch: Partial<CUTSCENE>): TIMELINE {
    return {
        ...timeline,
        [ref.shapeId]: { cutscenes: rowOf(timeline, ref.shapeId).map(c => c.id === ref.id ? { ...c, ...patch } : c) }
    };
}

export function applyDraft(timeline: TIMELINE, draft: TIME_DRAFT): TIMELINE {
    const next: TIMELINE = {};
    Object.keys(timeline).forEach(shapeId => {
        next[shapeId] = {
            cutscenes: rowOf(timeline, shapeId).map(c => draft[c.id] ? { ...c, ...draft[c.id] } : c)
        };
    });
    return next;
}

/** How far the given clips can move together without crossing 0 or a clip that isn't moving. */
export function moveLimits(timeline: TIMELINE, refs: CLIP_REF[]): [number, number] {
    const moving = new Set(refs.map(ref => ref.id));
    let lo = -Infinity;
    let hi = Infinity;
    findClips(timeline, refs).forEach(({ shapeId, cutscene }) => {
        const others = rowOf(timeline, shapeId).filter(c => !moving.has(c.id));
        const previousEnd = Math.max(0, ...others.filter(c => c.end <= cutscene.start + 1e-6).map(c => c.end));
        const nextStart = Math.min(Infinity, ...others.filter(c => c.start >= cutscene.end - 1e-6).map(c => c.start));
        lo = Math.max(lo, previousEnd - cutscene.start);
        hi = Math.min(hi, nextStart - cutscene.end);
    });
    return [lo, hi];
}

/** Allowed range for one edge of a clip while resizing. */
export function edgeLimits(timeline: TIMELINE, ref: CLIP_REF, edge: 'start' | 'end'): [number, number] {
    const clip = findClips(timeline, [ref])[0]?.cutscene;
    if (!clip) {
        return [0, 0];
    }
    const others = rowOf(timeline, ref.shapeId).filter(c => c.id !== ref.id);
    if (edge === 'start') {
        const previousEnd = Math.max(0, ...others.filter(c => c.end <= clip.start + 1e-6).map(c => c.end));
        return [previousEnd, clip.end - MIN_CUTSCENE_DURATION];
    }
    const nextStart = Math.min(Infinity, ...others.filter(c => c.start >= clip.end - 1e-6).map(c => c.start));
    return [clip.start + MIN_CUTSCENE_DURATION, nextStart];
}

/** Clip edges other than the given clips', used for snapping. */
export function snapEdges(timeline: TIMELINE, excludeIds: Set<string>): number[] {
    const edges: number[] = [0];
    Object.keys(timeline).forEach(shapeId => {
        rowOf(timeline, shapeId).forEach(c => {
            if (!excludeIds.has(c.id)) {
                edges.push(c.start, c.end);
            }
        });
    });
    return edges;
}

const overlaps = (a: { start: number, end: number }, b: { start: number, end: number }) =>
    a.start < b.end - 1e-6 && b.start < a.end - 1e-6;

/**
 * Inserts copies of `items`, keeping their relative timing, with the earliest one at `at`.
 * `rowFor` picks the destination row of each item (or null to skip it). If the copies would
 * overlap existing clips they're pushed later until they fit.
 */
export function pasteClips(
    timeline: TIMELINE,
    items: CLIPBOARD_ITEM[],
    at: number,
    rowFor: (item: CLIPBOARD_ITEM) => string | null
): { timeline: TIMELINE, pasted: CLIP_REF[] } {
    const placed = items
        .map(item => ({ shapeId: rowFor(item), cutscene: item.cutscene }))
        .filter((item): item is CLIPBOARD_ITEM => Boolean(item.shapeId));
    if (!placed.length) {
        return { timeline, pasted: [] };
    }
    const earliest = Math.min(...placed.map(item => item.cutscene.start));
    let copies = placed
        .sort((a, b) => a.cutscene.start - b.cutscene.start)
        .map(item => ({
            shapeId: item.shapeId,
            cutscene: {
                ...item.cutscene,
                id: generateId(),
                state: { ...item.cutscene.state },
                start: roundTime(item.cutscene.start - earliest + at),
                end: roundTime(item.cutscene.end - earliest + at),
            }
        }));

    // clips landing in the same row (e.g. pasting several rows onto one shape) are laid end to end
    const lastEndByRow: { [shapeId: string]: number } = {};
    copies = copies.map(item => {
        const lastEnd = lastEndByRow[item.shapeId];
        let { start, end } = item.cutscene;
        if (lastEnd !== undefined && start < lastEnd) {
            end = roundTime(end + lastEnd - start);
            start = lastEnd;
        }
        lastEndByRow[item.shapeId] = end;
        return { ...item, cutscene: { ...item.cutscene, start, end } };
    });

    // push the whole group later until nothing overlaps the existing clips
    for (let guard = 0; guard < 100; guard++) {
        let shift = 0;
        copies.forEach(item => {
            rowOf(timeline, item.shapeId).forEach(existing => {
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

    const next: TIMELINE = { ...timeline };
    copies.forEach(item => {
        next[item.shapeId] = { cutscenes: [...rowOf(next, item.shapeId), item.cutscene] };
    });
    return { timeline: next, pasted: copies.map(item => ({ shapeId: item.shapeId, id: item.cutscene.id })) };
}
