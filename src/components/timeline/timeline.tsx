import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    BsChevronDown, BsChevronUp, BsClipboard, BsFiles, BsPauseFill, BsPencil, BsPlayFill, BsPlusLg,
    BsArrowRepeat, BsScissors, BsSkipStartFill, BsTrash, BsZoomIn, BsZoomOut, BsArrowsExpand, BsLayers
} from 'react-icons/bs';
import { IconType } from 'react-icons';
import store, { State } from '../../store/store';
import { getActivePageIndex, getPageTimelines, getTimelineUi } from '../../selector/selector';
import { setPageLoop, setPageTimelines } from '../../actions/pages/pages.actions';
import { setEditing, setPlayback, setTimelineSelection } from '../../actions/timeline/timeline.actions';
import { timelinePlayer } from '../../timeline/player';
import { enterCutscene, exitCutscene, showTimeOnCanvas, watchShapeEdits } from '../../timeline/editing';
import {
    addCutscene, applyDraft, CLIPBOARD_ITEM, cloneCutscene, edgeLimits, findClips, moveLimits, nextTimelineName,
    pasteClips, removeClips, roundTime, snapEdges, TIME_DRAFT, updateClip
} from '../../timeline/clipOps';
import { createTimeline, cutsceneAt, findCutscene, isSnapshotFormat, orderedCutscenes } from '../../timeline/model';
import { CLIP_REF, CUTSCENE, MAX_ZOOM_SECONDS, MIN_ZOOM_SECONDS, TIMELINE_TRACK } from '../../timeline/timeline.types';
import { useEventListener } from '../../hooks/useEventListener';
import { formatTime } from './format';
import { Body, CLIP_GAP, ClipMenu, LABEL_WIDTH, ROW_COLORS, RULER_HEIGHT, TimelineContainer, Toolbar } from './timeline.styles';

const DEFAULT_VISIBLE_SECONDS = 10;
const SNAP_PX = 6;
const TICK_STEPS = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60];
const MIN_MAJOR_TICK_PX = 70;
const WHEEL_OPTIONS = { passive: false };
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl+';

// survives the timeline remounting (e.g. leaving and re-entering the editor)
let clipboard: CLIPBOARD_ITEM[] = [];

/** Timelines straight from the store, for handlers that run after other updates in the same tick. */
const latestTimelines = () => getPageTimelines(store.getState());

interface DRAG {
    mode: 'move' | 'start' | 'end';
    refs: CLIP_REF[];
    primary: CLIP_REF;
    pointerStartX: number;
    original: { [id: string]: { start: number, end: number } };
    limits: [number, number];
    edges: number[];
    moved: boolean;
}

interface MENU {
    x: number;
    y: number;
    timelineId: string;
    onClip: boolean;
}

const tickLabel = (t: number, step: number) => {
    if (t >= 60) {
        const m = Math.floor(t / 60);
        return `${m}:${String(Math.round(t - m * 60)).padStart(2, '0')}`;
    }
    return `${step < 1 ? t.toFixed(step < 0.1 ? 2 : 1).replace(/\.?0+$/, '') : t}s`;
};

/** Text field that edits a name in place; Enter or blur saves, Escape cancels. */
const InlineRename: React.FC<{ value: string, onDone: (value: string | null) => void }> = function ({ value, onDone }) {
    const [text, setText] = useState(value);
    const done = useRef(false);
    const finish = (result: string | null) => {
        if (!done.current) {
            done.current = true;
            onDone(result);
        }
    };
    return (
        <input
            className='rename'
            value={text}
            autoFocus
            onFocus={e => e.target.select()}
            onChange={e => setText(e.target.value)}
            onBlur={() => finish(text.trim() || null)}
            onKeyDown={e => {
                e.stopPropagation();
                if (e.key === 'Enter') finish(text.trim() || null);
                if (e.key === 'Escape') finish(null);
            }}
            onPointerDown={e => e.stopPropagation()}
            onDoubleClick={e => e.stopPropagation()}
        />
    );
}

const Timeline: React.FC = function () {
    const dispatch = useDispatch();
    const timelines = useSelector<State, TIMELINE_TRACK[]>(getPageTimelines);
    const activePageIndex = useSelector<State, number>(getActivePageIndex);
    const loop = useSelector<State, boolean>(state => Boolean(state.page.pages[state.page.activePageIndex].loop));
    const { time, playing, selection, editing } = useSelector(getTimelineUi);

    const bodyRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<DRAG | null>(null);
    const draftRef = useRef<TIME_DRAFT | null>(null);
    const [viewportWidth, setViewportWidth] = useState(800);
    const [pxPerSecond, setPxPerSecond] = useState<number | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [draft, setDraft] = useState<TIME_DRAFT | null>(null);
    const [menu, setMenu] = useState<MENU | null>(null);
    const [renaming, setRenaming] = useState<string | null>(null);
    const [hasClipboard, setHasClipboard] = useState(clipboard.length > 0);

    // ---------- derived data

    timelinePlayer.sync(timelines);
    const duration = useMemo(() => timelinePlayer.duration, [timelines]); // eslint-disable-line react-hooks/exhaustive-deps
    const shownTimelines = useMemo(() => draft ? applyDraft(timelines, draft) : timelines, [timelines, draft]);

    const validSelection = useMemo(
        () => findClips(timelines, selection).map(({ timelineId, cutscene }) => ({ timelineId, id: cutscene.id })),
        [timelines, selection]
    );
    const selectedIds = useMemo(() => new Set(validSelection.map(ref => ref.id)), [validSelection]);
    const setSelection = useCallback((refs: CLIP_REF[]) => dispatch(setTimelineSelection(refs)), [dispatch]);
    // where "Add cutscene" and paste go
    const focusTimelineId = validSelection[0]?.timelineId || timelines[0].id;

    const minPps = viewportWidth / MAX_ZOOM_SECONDS;
    const maxPps = viewportWidth / MIN_ZOOM_SECONDS;
    const pps = Math.min(maxPps, Math.max(minPps, pxPerSecond ?? viewportWidth / DEFAULT_VISIBLE_SECONDS));
    const visibleSeconds = viewportWidth / pps;
    const contentSeconds = Math.max(duration + 2, visibleSeconds, DEFAULT_VISIBLE_SECONDS, time + 1);
    const contentWidth = contentSeconds * pps;
    const majorStep = TICK_STEPS.find(step => step * pps >= MIN_MAJOR_TICK_PX) || 60;
    const minorStep = majorStep / 5;

    // ---------- layout

    useLayoutEffect(() => {
        const body = bodyRef.current;
        if (!body) {
            return;
        }
        const measure = () => setViewportWidth(Math.max(200, body.clientWidth - LABEL_WIDTH));
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(body);
        return () => observer.disconnect();
    }, [collapsed]);

    // ---------- editing a cutscene follows the selection

    /** Selects and opens the cutscene under `time` in a timeline, so the canvas is always editable. */
    const openCutsceneAt = useCallback((timelineId: string, t: number) => {
        const tracks = latestTimelines();
        const track = tracks.find(tr => tr.id === timelineId) || tracks[0];
        const ref = { timelineId: track.id, id: cutsceneAt(track, t).id };
        setSelection([ref]);
        enterCutscene(ref);
    }, [setSelection]);

    // the last clicked cutscene is the one being edited; with nothing selected, the one under the playhead
    const editTarget = validSelection[validSelection.length - 1];
    const editKey = editTarget ? `${editTarget.timelineId}/${editTarget.id}` : null;
    useEffect(() => {
        if (playing) {
            return;
        }
        if (!editTarget) {
            openCutsceneAt(focusTimelineId, time);
        } else if (store.getState().timeline.editing?.cutsceneId !== editTarget.id) {
            enterCutscene(editTarget);
        }
    }, [editKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // shape edits go into the selected cutscene (or refresh a paused preview)
    useEffect(() => watchShapeEdits(), []);

    // keep a paused preview in step with timeline changes
    useEffect(() => {
        if (!editing && !playing && time > 0) {
            showTimeOnCanvas(time);
        }
    }, [timelines]); // eslint-disable-line react-hooks/exhaustive-deps

    // keep the playhead on the end of the cutscene being edited when it's moved or resized
    const editedEnd = editing ? findCutscene(timelines, editing.timelineId, editing.cutsceneId)?.end : undefined;
    useEffect(() => {
        if (editedEnd !== undefined && editedEnd !== time) {
            dispatch(setPlayback({ time: editedEnd }));
        }
    }, [editedEnd]); // eslint-disable-line react-hooks/exhaustive-deps

    // ---------- playback

    const pause = useCallback(() => {
        timelinePlayer.pause();
        dispatch(setPlayback({ playing: false }));
        openCutsceneAt(focusTimelineId, store.getState().timeline.time);
    }, [dispatch, focusTimelineId, openCutsceneAt]);

    const seek = useCallback((t: number) => {
        if (playing) {
            timelinePlayer.pause();
            dispatch(setPlayback({ playing: false }));
        }
        showTimeOnCanvas(Math.max(0, roundTime(t)));
    }, [dispatch, playing]);

    /** Moves the playhead and opens the cutscene there. */
    const seekAndEdit = useCallback((t: number, timelineId = focusTimelineId) => {
        exitCutscene(false);
        seek(t);
        openCutsceneAt(timelineId, Math.max(0, roundTime(t)));
    }, [focusTimelineId, openCutsceneAt, seek]);

    const play = useCallback(() => {
        if (duration <= 0) {
            return;
        }
        // the canvas shows the animation while playing; editing resumes when it stops
        exitCutscene(false);
        const from = time >= duration - 0.01 ? 0 : time;
        dispatch(setPlayback({ playing: true }));
        timelinePlayer.sync(latestTimelines());
        timelinePlayer.play(
            from,
            (t, preview) => dispatch(setPlayback({ time: t, preview })),
            () => {
                dispatch(setPlayback({ playing: false }));
                openCutsceneAt(focusTimelineId, store.getState().timeline.time);
            },
            loop
        );
    }, [dispatch, duration, focusTimelineId, loop, openCutsceneAt, time]);

    const togglePlay = () => playing ? pause() : play();

    // a different page has different timelines: create them if the page has none yet
    // (older documents), then open the first timeline's default cutscene for editing
    useEffect(() => {
        timelinePlayer.pause();
        dispatch(setEditing(null));
        dispatch(setPlayback({ playing: false, time: 0, preview: null }));
        const page = store.getState().page.pages[activePageIndex];
        let tracks = page.timelines;
        if (!isSnapshotFormat(tracks)) {
            tracks = [createTimeline('Timeline 1', page.shapes)];
            dispatch(setPageTimelines(tracks));
        }
        setSelection([{ timelineId: tracks[0].id, id: orderedCutscenes(tracks[0])[0].id }]);
    }, [activePageIndex]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => () => {
        timelinePlayer.pause();
        exitCutscene(false);
        dispatch(setTimelineSelection([]));
        dispatch(setPlayback({ playing: false, time: 0, preview: null }));
    }, [dispatch]);

    // keep the playhead in view while playing
    useEffect(() => {
        const body = bodyRef.current;
        if (!playing || !body) {
            return;
        }
        const x = time * pps;
        if (x < body.scrollLeft || x > body.scrollLeft + viewportWidth - 40) {
            body.scrollLeft = Math.max(0, x - 40);
        }
    }, [time, playing, pps, viewportWidth]);

    // ---------- zoom

    const zoomTo = useCallback((nextPps: number, anchorClientX?: number) => {
        const body = bodyRef.current;
        const clamped = Math.min(maxPps, Math.max(minPps, nextPps));
        if (body) {
            // keep the time under the pointer (or the playhead) where it is
            const rect = body.getBoundingClientRect();
            const anchorX = anchorClientX !== undefined
                ? anchorClientX - rect.left - LABEL_WIDTH
                : time * pps - body.scrollLeft;
            const anchorTime = (body.scrollLeft + anchorX) / pps;
            requestAnimationFrame(() => {
                body.scrollLeft = Math.max(0, anchorTime * clamped - anchorX);
            });
        }
        setPxPerSecond(clamped);
    }, [maxPps, minPps, pps, time]);

    const zoomToFit = () => {
        const target = Math.max(duration + 1, DEFAULT_VISIBLE_SECONDS / 2);
        setPxPerSecond(Math.min(maxPps, Math.max(minPps, viewportWidth / target)));
        if (bodyRef.current) {
            bodyRef.current.scrollLeft = 0;
        }
    };

    useEventListener('wheel', (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomTo(pps * Math.exp(-e.deltaY * 0.002), e.clientX);
        }
    }, bodyRef, WHEEL_OPTIONS);

    // slider works on a log scale so each step feels the same
    const sliderValue = Math.round(100 * Math.log(pps / minPps) / Math.log(maxPps / minPps));
    const fromSlider = (value: number) => minPps * Math.pow(maxPps / minPps, value / 100);

    // ---------- timeline edits

    const commit = useCallback((next: TIMELINE_TRACK[]) => dispatch(setPageTimelines(next)), [dispatch]);

    const addCutsceneTo = useCallback((timelineId: string) => {
        const result = addCutscene(latestTimelines(), timelineId);
        commit(result.tracks);
        setSelection([result.ref]);
    }, [commit, setSelection]);

    const addTimeline = () => {
        const track = createTimeline(nextTimelineName(timelines));
        commit([...latestTimelines(), track]);
        setSelection([{ timelineId: track.id, id: track.cutscenes[0].id }]);
        setRenaming(track.id);
    };

    const deleteTimeline = (timelineId: string) => {
        const track = timelines.find(t => t.id === timelineId);
        if (!track || timelines.length <= 1) {
            return;
        }
        if (track.cutscenes.length && !window.confirm(`Delete “${track.name}” and its ${track.cutscenes.length} cutscene(s)?`)) {
            return;
        }
        setSelection([]);
        exitCutscene(false);
        commit(latestTimelines().filter(t => t.id !== timelineId));
    };

    const rename = (id: string, name: string | null) => {
        setRenaming(null);
        containerRef.current?.focus();
        if (!name) {
            return;
        }
        const current = latestTimelines();
        if (current.some(t => t.id === id)) {
            commit(current.map(t => t.id === id ? { ...t, name } : t));
            return;
        }
        const owner = current.find(t => t.cutscenes.some(c => c.id === id));
        owner && commit(updateClip(current, { timelineId: owner.id, id }, { name }));
    };

    const copySelection = useCallback(() => {
        const items = findClips(timelines, validSelection);
        if (items.length) {
            clipboard = items.map(item => ({ timelineId: item.timelineId, cutscene: cloneCutscene(item.cutscene) }));
            setHasClipboard(true);
        }
    }, [timelines, validSelection]);

    const deleteSelection = useCallback(() => {
        if (validSelection.length) {
            const timelineId = focusTimelineId;
            exitCutscene(false);
            commit(removeClips(latestTimelines(), validSelection));
            openCutsceneAt(timelineId, store.getState().timeline.time);
        }
    }, [commit, focusTimelineId, openCutsceneAt, validSelection]);

    const pasteAt = useCallback((at: number, targetTimelineId?: string) => {
        if (!clipboard.length) {
            return;
        }
        const current = latestTimelines();
        // the right-clicked timeline or the selected cutscene's timeline receives everything;
        // otherwise each cutscene goes back to the timeline it was copied from
        const target = targetTimelineId || (validSelection.length ? focusTimelineId : null);
        const result = pasteClips(current, clipboard, at, item =>
            target || (current.some(t => t.id === item.timelineId) ? item.timelineId : current[0].id)
        );
        if (result.pasted.length) {
            commit(result.tracks);
            setSelection(result.pasted);
        }
    }, [commit, focusTimelineId, setSelection, validSelection.length]);

    const duplicateSelection = useCallback(() => {
        const current = latestTimelines();
        const items = findClips(current, validSelection);
        if (!items.length) {
            return;
        }
        const after = Math.max(...items.map(item => item.cutscene.end));
        const result = pasteClips(current, items, after, item => item.timelineId);
        commit(result.tracks);
        setSelection(result.pasted);
    }, [commit, setSelection, validSelection]);

    const nudgeSelection = useCallback((delta: number) => {
        if (!validSelection.length) {
            return;
        }
        const current = latestTimelines();
        const [lo, hi] = moveLimits(current, validSelection);
        const d = Math.min(hi, Math.max(lo, delta));
        const moved: TIME_DRAFT = {};
        findClips(current, validSelection).forEach(({ cutscene }) => {
            moved[cutscene.id] = { start: roundTime(cutscene.start + d), end: roundTime(cutscene.end + d) };
        });
        commit(applyDraft(current, moved));
    }, [commit, validSelection]);

    // ---------- pointer interactions

    const timeFromClientX = (clientX: number) => {
        const body = bodyRef.current!;
        const rect = body.getBoundingClientRect();
        return Math.max(0, (clientX - rect.left - LABEL_WIDTH + body.scrollLeft) / pps);
    };

    /** Dragging shows the animation frame by frame; letting go opens the cutscene there. */
    const startScrub = (e: React.PointerEvent, timelineId = focusTimelineId) => {
        if (e.button !== 0) {
            return;
        }
        containerRef.current?.focus();
        exitCutscene(false);
        let t = timeFromClientX(e.clientX);
        seek(t);
        const onMove = (ev: PointerEvent) => {
            t = timeFromClientX(ev.clientX);
            seek(t);
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            openCutsceneAt(timelineId, roundTime(t));
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const snap = (t: number, edges: number[], disabled: boolean) => {
        if (disabled) {
            return t;
        }
        let best = t;
        let bestDistance = SNAP_PX / pps;
        [...edges, time].forEach(edge => {
            const distance = Math.abs(edge - t);
            if (distance < bestDistance) {
                best = edge;
                bestDistance = distance;
            }
        });
        return best;
    };

    const startClipDrag = (e: React.PointerEvent, timelineId: string, cutscene: CUTSCENE, mode: DRAG['mode']) => {
        if (e.button !== 0) {
            return;
        }
        e.stopPropagation();
        containerRef.current?.focus();
        const ref = { timelineId, id: cutscene.id };
        const isSelected = selectedIds.has(cutscene.id);
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
            setSelection(isSelected ? validSelection.filter(r => r.id !== cutscene.id) : [...validSelection, ref]);
            return;
        }
        const refs = isSelected && mode === 'move' ? validSelection : [ref];
        setSelection(refs);

        const original: DRAG['original'] = {};
        findClips(timelines, refs).forEach(item => {
            original[item.cutscene.id] = { start: item.cutscene.start, end: item.cutscene.end };
        });
        dragRef.current = {
            mode,
            refs,
            primary: ref,
            pointerStartX: e.clientX,
            original,
            limits: mode === 'move' ? moveLimits(timelines, refs) : edgeLimits(timelines, ref, mode),
            edges: snapEdges(timelines, new Set(refs.map(r => r.id))),
            moved: false,
        };

        const onMove = (ev: PointerEvent) => {
            const drag = dragRef.current;
            if (!drag) {
                return;
            }
            const dx = ev.clientX - drag.pointerStartX;
            if (!drag.moved && Math.abs(dx) < 3) {
                return;
            }
            drag.moved = true;
            const dt = dx / pps;
            const noSnap = ev.altKey;
            const primary = drag.original[drag.primary.id];
            const next: TIME_DRAFT = {};

            if (drag.mode === 'move') {
                // snap whichever edge of the grabbed clip lands closer to something
                const snappedStart = snap(primary.start + dt, drag.edges, noSnap) - primary.start;
                const snappedEnd = snap(primary.end + dt, drag.edges, noSnap) - primary.end;
                let delta = Math.abs(snappedStart - dt) <= Math.abs(snappedEnd - dt) ? snappedStart : snappedEnd;
                if (Math.abs(snappedStart - dt) < 1e-9 && Math.abs(snappedEnd - dt) < 1e-9) {
                    delta = dt;
                }
                delta = Math.min(drag.limits[1], Math.max(drag.limits[0], delta));
                Object.keys(drag.original).forEach(id => {
                    next[id] = { start: roundTime(drag.original[id].start + delta), end: roundTime(drag.original[id].end + delta) };
                });
            } else {
                const value = snap(primary[drag.mode] + dt, drag.edges, noSnap);
                const clamped = roundTime(Math.min(drag.limits[1], Math.max(drag.limits[0], value)));
                next[drag.primary.id] = { ...primary, [drag.mode]: clamped };
            }
            draftRef.current = next;
            setDraft(next);
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            const drag = dragRef.current;
            const finalDraft = draftRef.current;
            dragRef.current = null;
            draftRef.current = null;
            if (drag?.moved && finalDraft) {
                // edits to the cutscene may have been saved meanwhile, so apply to the latest timelines
                commit(applyDraft(latestTimelines(), finalDraft));
            } else if (drag && !drag.moved && drag.refs.length > 1) {
                // plain click inside a multi-selection selects just that clip
                setSelection([drag.primary]);
            }
            setDraft(null);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const openMenu = (e: React.MouseEvent, timelineId: string, cutscene?: CUTSCENE) => {
        e.preventDefault();
        e.stopPropagation();
        if (cutscene && !selectedIds.has(cutscene.id)) {
            setSelection([{ timelineId, id: cutscene.id }]);
        }
        setMenu({ x: e.clientX, y: e.clientY, timelineId, onClip: Boolean(cutscene) });
    };

    // menu items unmount on click, so hand keyboard focus back to the timeline for Del/⌘C etc.
    const closeMenu = () => {
        setMenu(null);
        containerRef.current?.focus();
    };

    // the timeline sits at the bottom of the screen, so open the menu upwards / leftwards when needed
    useLayoutEffect(() => {
        const el = menuRef.current;
        if (!menu || !el) {
            return;
        }
        const { width, height } = el.getBoundingClientRect();
        const x = Math.min(menu.x, window.innerWidth - width - 8);
        const y = menu.y + height > window.innerHeight - 8 ? Math.max(8, menu.y - height) : menu.y;
        if (x !== menu.x || y !== menu.y) {
            setMenu({ ...menu, x, y });
        }
    }, [menu]);

    useEventListener('pointerdown', (e: PointerEvent) => {
        if (menu && !(e.target as HTMLElement).closest?.('[data-timeline-menu]')) {
            setMenu(null);
        }
    });

    // ---------- keyboard

    const onKeyDown = (e: React.KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('input, select, textarea')) {
            return;
        }
        const mod = e.metaKey || e.ctrlKey;
        const key = e.key.toLowerCase();
        let handled = true;

        if (key === ' ') togglePlay();
        else if (mod && key === 'c') copySelection();
        else if (mod && key === 'x') { copySelection(); deleteSelection(); }
        else if (mod && key === 'v') pasteAt(time);
        else if (mod && key === 'd') duplicateSelection();
        else if (mod && key === 'a') setSelection(timelines.flatMap(t => t.cutscenes.map(c => ({ timelineId: t.id, id: c.id }))));
        else if (e.key === 'Delete' || e.key === 'Backspace') deleteSelection();
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const step = (e.shiftKey ? 1 : 0.1) * (e.key === 'ArrowLeft' ? -1 : 1);
            validSelection.length > 1 ? nudgeSelection(step) : seekAndEdit(time + step);
        }
        else if (e.key === 'Home') seekAndEdit(0);
        else if (e.key === 'End') seekAndEdit(duration);
        else if ((e.key === 'Enter' || e.key === 'F2') && validSelection.length === 1) setRenaming(validSelection[0].id);
        else if (e.key === 'Escape') { editTarget && setSelection([editTarget]); setMenu(null); }
        else handled = false;

        if (handled) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    // ---------- render helpers

    const ticks = useMemo(() => {
        const list: Array<{ t: number, major: boolean }> = [];
        const count = Math.ceil(contentSeconds / minorStep);
        for (let i = 0; i <= count; i++) {
            list.push({ t: Math.round(i * minorStep * 1000) / 1000, major: i % 5 === 0 });
        }
        return list;
    }, [contentSeconds, minorStep]);

    const toolButton = (Icon: IconType, label: string, onClick: () => void, disabled = false, className = 'iconButton') => (
        <button className={className} onClick={onClick} disabled={disabled} title={label} aria-label={label}>
            <Icon />
        </button>
    );

    const hasSelection = validSelection.length > 0;
    /** e.g. "3 shapes" for a default cutscene, "+1 in · 2 changed · 1 out" for the rest */
    const describeCutscene = (cutscene: CUTSCENE) => {
        const added = Object.keys(cutscene.added).length;
        const changed = Object.keys(cutscene.changed).length;
        const removed = cutscene.removed.length;
        if (cutscene.isDefault) {
            return `${added} shape${added === 1 ? '' : 's'}`;
        }
        const parts = [added && `${added} in`, changed && `${changed} changed`, removed && `${removed} out`].filter(Boolean);
        return parts.length ? parts.join(' · ') : 'no changes';
    };

    return (
        <TimelineContainer
            ref={containerRef}
            className={collapsed ? 'collapsed' : ''}
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label='Animation timeline'
        >
            <Toolbar>
                {toolButton(playing ? BsPauseFill : BsPlayFill, playing ? 'Pause (Space)' : 'Play (Space)', togglePlay, duration <= 0, 'iconButton play')}
                {toolButton(BsSkipStartFill, 'Back to start (Home)', () => seekAndEdit(0))}
                <button
                    className={`iconButton toggle${loop ? ' on' : ''}`}
                    onClick={() => dispatch(setPageLoop(!loop))}
                    title={loop ? 'Loop is on' : 'Loop is off'}
                    aria-label='Loop'
                    aria-pressed={loop}
                >
                    <BsArrowRepeat />
                </button>
                <span className='time'>
                    {formatTime(time)} <span className='total'>/ {formatTime(duration)}</span>
                </span>
                <div className='divider' />
                <button
                    className='textButton'
                    onClick={() => addCutsceneTo(focusTimelineId)}
                    title={`Add a 1 second cutscene at the end of ${timelines.find(t => t.id === focusTimelineId)?.name}`}
                >
                    <BsPlusLg /> Add cutscene
                </button>
                <div className='divider' />
                {toolButton(BsFiles, `Copy (${MOD}C)`, copySelection, !hasSelection)}
                {toolButton(BsScissors, `Cut (${MOD}X)`, () => { copySelection(); deleteSelection(); }, !hasSelection)}
                {toolButton(BsClipboard, `Paste at playhead (${MOD}V)`, () => pasteAt(time), !hasClipboard)}
                {toolButton(BsPencil, 'Rename (Enter)', () => validSelection.length === 1 && setRenaming(validSelection[0].id), validSelection.length !== 1)}
                {toolButton(BsTrash, 'Delete (Del)', deleteSelection, !hasSelection)}
                <div className='spacer' />
                <div className='zoom'>
                    {toolButton(BsZoomOut, 'Zoom out', () => zoomTo(pps / 1.5))}
                    <input
                        type='range'
                        min={0}
                        max={100}
                        value={sliderValue}
                        onChange={e => zoomTo(fromSlider(Number(e.target.value)))}
                        aria-label='Zoom'
                        title={`${MOD}scroll to zoom`}
                    />
                    {toolButton(BsZoomIn, 'Zoom in', () => zoomTo(pps * 1.5))}
                    <span className='zoomLabel'>{visibleSeconds < 10 ? visibleSeconds.toFixed(1) : Math.round(visibleSeconds)}s</span>
                    {toolButton(BsArrowsExpand, 'Fit animation', zoomToFit)}
                </div>
                <div className='divider' />
                {toolButton(collapsed ? BsChevronUp : BsChevronDown, collapsed ? 'Show timeline' : 'Hide timeline', () => setCollapsed(c => !c))}
            </Toolbar>

            {
                !collapsed
                    ? (
                        <Body ref={bodyRef}>
                            <div className='content' style={{ width: LABEL_WIDTH + contentWidth }}>
                                <div className='ruler'>
                                    <div className='corner'>Timelines</div>
                                    <div className='scale' style={{ width: contentWidth }} onPointerDown={e => startScrub(e)}>
                                        <svg width={contentWidth} height={RULER_HEIGHT}>
                                            {
                                                ticks.map(({ t, major }) => (
                                                    <g key={t}>
                                                        <line
                                                            x1={t * pps} x2={t * pps}
                                                            y1={major ? RULER_HEIGHT - 12 : RULER_HEIGHT - 5} y2={RULER_HEIGHT}
                                                            stroke={major ? '#9ca3af' : '#d1d5db'}
                                                        />
                                                        {major ? <text x={t * pps + 4} y={12} fontSize={10} fill='#6b7280'>{tickLabel(t, majorStep)}</text> : null}
                                                    </g>
                                                ))
                                            }
                                        </svg>
                                    </div>
                                </div>

                                {
                                    shownTimelines.map((track, rowIndex) => {
                                        const color = ROW_COLORS[rowIndex % ROW_COLORS.length];
                                        return (
                                            <div key={track.id} className={`row${track.id === focusTimelineId && hasSelection ? ' active' : ''}`}>
                                                <div
                                                    className='label'
                                                    onDoubleClick={() => setRenaming(track.id)}
                                                    onContextMenu={e => openMenu(e, track.id)}
                                                    title={`${track.name} · double-click to rename`}
                                                >
                                                    <BsLayers className='swatchIcon' style={{ color }} />
                                                    {
                                                        renaming === track.id
                                                            ? <InlineRename value={track.name} onDone={name => rename(track.id, name)} />
                                                            : <span className='name'>{track.name}</span>
                                                    }
                                                    <button
                                                        className='addCutscene'
                                                        title='Add a 1 second cutscene'
                                                        aria-label={`Add cutscene to ${track.name}`}
                                                        onClick={e => { e.stopPropagation(); addCutsceneTo(track.id); }}
                                                        onDoubleClick={e => e.stopPropagation()}
                                                    >
                                                        <BsPlusLg />
                                                    </button>
                                                </div>
                                                <div
                                                    className='track'
                                                    style={{ width: contentWidth, backgroundSize: `${majorStep * pps}px 100%` }}
                                                    onPointerDown={e => startScrub(e, track.id)}
                                                    onContextMenu={e => openMenu(e, track.id)}
                                                >
                                                    {
                                                        track.cutscenes.length === 1
                                                            ? <span className='trackHint' style={{ left: track.cutscenes[0].end * pps + 12 }}>Press + to add a cutscene</span>
                                                            : null
                                                    }
                                                    {
                                                        track.cutscenes.map(cutscene => {
                                                            const selected = selectedIds.has(cutscene.id);
                                                            const summary = describeCutscene(cutscene);
                                                            const isEmpty = !cutscene.isDefault && summary === 'no changes';
                                                            return (
                                                                <div
                                                                    key={cutscene.id}
                                                                    className={`clip${selected ? ' selected' : ''}${draft?.[cutscene.id] ? ' dragging' : ''}${isEmpty ? ' noChanges' : ''}${cutscene.isDefault ? ' default' : ''}`}
                                                                    style={{
                                                                        // inset so back-to-back cutscenes keep a visible gap
                                                                        left: cutscene.start * pps + CLIP_GAP,
                                                                        width: Math.max(6, (cutscene.end - cutscene.start) * pps - CLIP_GAP * 2),
                                                                        backgroundColor: color,
                                                                    }}
                                                                    title={`${cutscene.name}${cutscene.isDefault ? ' (starting state)' : ''}\n${formatTime(cutscene.start)} → ${formatTime(cutscene.end)} · ${summary}\nClick to edit · double-click to rename`}
                                                                    onPointerDown={e => startClipDrag(e, track.id, cutscene, 'move')}
                                                                    onDoubleClick={() => setRenaming(cutscene.id)}
                                                                    onContextMenu={e => openMenu(e, track.id, cutscene)}
                                                                >
                                                                    {
                                                                        renaming === cutscene.id
                                                                            ? <InlineRename value={cutscene.name} onDone={name => rename(cutscene.id, name)} />
                                                                            : (
                                                                                <span className='clipLabel'>
                                                                                    {cutscene.name}
                                                                                    <span className='clipMeta'> · {summary}</span>
                                                                                </span>
                                                                            )
                                                                    }
                                                                    <span className='handle start' onPointerDown={e => startClipDrag(e, track.id, cutscene, 'start')} />
                                                                    <span className='handle end' onPointerDown={e => startClipDrag(e, track.id, cutscene, 'end')} />
                                                                </div>
                                                            );
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })
                                }

                                <div className='row addRow'>
                                    <button className='label addTimeline' onClick={addTimeline}>
                                        <BsPlusLg /> Add timeline
                                    </button>
                                </div>

                                <div className='playhead' style={{ left: LABEL_WIDTH + time * pps }} />
                            </div>
                        </Body>
                    )
                    : null
            }

            {
                menu
                    ? (
                        <ClipMenu ref={menuRef} data-timeline-menu style={{ left: menu.x, top: menu.y }} role='menu' onContextMenu={e => e.preventDefault()}>
                            {
                                menu.onClip
                                    ? (
                                        <>
                                            <button disabled={validSelection.length !== 1} onClick={() => { setRenaming(validSelection[0]?.id); setMenu(null); }}>
                                                <BsPencil /> Rename <span className='shortcut'>Enter</span>
                                            </button>
                                            <div className='separator' />
                                            <button onClick={() => { copySelection(); closeMenu(); }}><BsFiles /> Copy <span className='shortcut'>{MOD}C</span></button>
                                            <button onClick={() => { copySelection(); deleteSelection(); closeMenu(); }}><BsScissors /> Cut <span className='shortcut'>{MOD}X</span></button>
                                            <button onClick={() => { duplicateSelection(); closeMenu(); }}><BsFiles /> Duplicate <span className='shortcut'>{MOD}D</span></button>
                                        </>
                                    )
                                    : (
                                        <>
                                            <button onClick={() => { setRenaming(menu.timelineId); setMenu(null); }}><BsPencil /> Rename timeline</button>
                                            <button onClick={() => { addCutsceneTo(menu.timelineId); closeMenu(); }}><BsPlusLg /> Add cutscene</button>
                                            <div className='separator' />
                                        </>
                                    )
                            }
                            <button disabled={!hasClipboard} onClick={() => { pasteAt(time, menu.timelineId); closeMenu(); }}>
                                <BsClipboard /> Paste at playhead <span className='shortcut'>{MOD}V</span>
                            </button>
                            <div className='separator' />
                            {
                                menu.onClip
                                    ? <button className='danger' onClick={() => { deleteSelection(); closeMenu(); }}><BsTrash /> Delete <span className='shortcut'>Del</span></button>
                                    : <button className='danger' disabled={timelines.length <= 1} onClick={() => { deleteTimeline(menu.timelineId); closeMenu(); }}><BsTrash /> Delete timeline</button>
                            }
                        </ClipMenu>
                    )
                    : null
            }
        </TimelineContainer>
    );
}

export default Timeline;
