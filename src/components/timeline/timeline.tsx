import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isEqual } from 'lodash';
import {
    BsCheckLg, BsChevronDown, BsChevronUp, BsClipboard, BsFiles, BsPauseFill, BsPencil,
    BsPlayFill, BsRecordCircle, BsScissors, BsSkipStartFill, BsTrash, BsX, BsZoomIn, BsZoomOut, BsArrowsExpand
} from 'react-icons/bs';
import { IconType } from 'react-icons';
import { State } from '../../store/store';
import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import { getActiveShapesInfo, getActivePageIndex, getPageTimeline, getShapesOfCurrentPage, getTimelineUi } from '../../selector/selector';
import { setActiveShape, setPageTimeline } from '../../actions/pages/pages.actions';
import { setPlayback } from '../../actions/timeline/timeline.actions';
import { timelinePlayer } from '../../timeline/player';
import { cancelRecording, commitRecording, showTimeOnCanvas, startRecording } from '../../timeline/recording';
import { describeState } from '../../timeline/animatable';
import {
    applyDraft, CLIPBOARD_ITEM, CLIP_REF, edgeLimits, findClips, moveLimits, pasteClips,
    removeClips, roundTime, snapEdges, TIME_DRAFT, updateClip
} from '../../timeline/clipOps';
import { CUTSCENE, EASES, MAX_ZOOM_SECONDS, MIN_CUTSCENE_DURATION, MIN_ZOOM_SECONDS, TIMELINE } from '../../timeline/timeline.types';
import { useEventListener } from '../../hooks/useEventListener';
import { formatTime } from './format';
import { Body, ClipMenu, Inspector, LABEL_WIDTH, ROW_COLORS, RULER_HEIGHT, TimelineContainer, Toolbar } from './timeline.styles';

const DEFAULT_VISIBLE_SECONDS = 10;
const SNAP_PX = 6;
const TICK_STEPS = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60];
const MIN_MAJOR_TICK_PX = 70;
const WHEEL_OPTIONS = { passive: false };
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl+';

// survives the timeline remounting (e.g. leaving and re-entering the editor)
let clipboard: CLIPBOARD_ITEM[] = [];

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
    shapeId: string;
    onClip: boolean;
}

const tickLabel = (t: number, step: number) => {
    if (t >= 60) {
        const m = Math.floor(t / 60);
        return `${m}:${String(Math.round(t - m * 60)).padStart(2, '0')}`;
    }
    return `${step < 1 ? t.toFixed(step < 0.1 ? 2 : 1).replace(/\.?0+$/, '') : t}s`;
};

const Timeline: React.FC = function () {
    const dispatch = useDispatch();
    const timeline = useSelector<State, TIMELINE>(getPageTimeline);
    const shapes = useSelector<State, { [id: string]: AVAILABLE_SHAPES }>(getShapesOfCurrentPage);
    const activeShapes = useSelector<State, string[]>(getActiveShapesInfo, isEqual);
    const activePageIndex = useSelector<State, number>(getActivePageIndex);
    const { time, playing, recording } = useSelector(getTimelineUi);

    const bodyRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLElement>(null);
    const [viewportWidth, setViewportWidth] = useState(800);
    const [pxPerSecond, setPxPerSecond] = useState<number | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [selection, setSelection] = useState<CLIP_REF[]>([]);
    const [draft, setDraft] = useState<TIME_DRAFT | null>(null);
    const [menu, setMenu] = useState<MENU | null>(null);
    const [hasClipboard, setHasClipboard] = useState(clipboard.length > 0);
    const dragRef = useRef<DRAG | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const draftRef = useRef<TIME_DRAFT | null>(null);

    // ---------- derived data

    timelinePlayer.sync(timeline, shapes);
    const duration = useMemo(() => timelinePlayer.duration, [timeline, shapes]); // eslint-disable-line react-hooks/exhaustive-deps

    const shownTimeline = useMemo(() => draft ? applyDraft(timeline, draft) : timeline, [timeline, draft]);

    const rows = useMemo(() => Object.keys(shapes).filter(id =>
        shapes[id].render && (timeline[id]?.cutscenes.length || activeShapes.includes(id))
    ), [shapes, timeline, activeShapes]);

    const validSelection = useMemo(
        () => findClips(timeline, selection).map(({ shapeId, cutscene }) => ({ shapeId, id: cutscene.id })),
        [timeline, selection]
    );
    const selectedIds = useMemo(() => new Set(validSelection.map(ref => ref.id)), [validSelection]);
    const singleSelected = validSelection.length === 1 ? findClips(timeline, validSelection)[0] : null;

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

    // ---------- playback

    const pause = useCallback(() => {
        const t = timelinePlayer.pause();
        dispatch(setPlayback({ playing: false, time: t }));
    }, [dispatch]);

    const seek = useCallback((t: number) => {
        if (playing) {
            timelinePlayer.pause();
            dispatch(setPlayback({ playing: false }));
        }
        showTimeOnCanvas(Math.max(0, roundTime(t)));
    }, [dispatch, playing]);

    const play = useCallback(() => {
        if (timelinePlayer.isEmpty || recording) {
            return;
        }
        const from = time >= duration - 0.01 ? 0 : time;
        dispatch(setPlayback({ playing: true }));
        timelinePlayer.play(
            from,
            (t, preview) => dispatch(setPlayback({ time: t, preview })),
            () => dispatch(setPlayback({ playing: false }))
        );
    }, [dispatch, duration, recording, time]);

    const togglePlay = () => playing ? pause() : play();

    // re-render the preview when shapes or animations change while paused mid-timeline
    useEffect(() => {
        if (!playing && !recording && time > 0) {
            showTimeOnCanvas(time);
        }
    }, [timeline, shapes]); // eslint-disable-line react-hooks/exhaustive-deps

    // a different page has a different timeline
    useEffect(() => {
        timelinePlayer.pause();
        setSelection([]);
        dispatch(setPlayback({ playing: false, time: 0, preview: null }));
    }, [activePageIndex, dispatch]);

    useEffect(() => () => {
        timelinePlayer.pause();
        cancelRecording();
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

    const commit = useCallback((next: TIMELINE) => dispatch(setPageTimeline(next)), [dispatch]);

    const copySelection = useCallback(() => {
        const items = findClips(timeline, validSelection);
        if (items.length) {
            clipboard = items.map(item => ({ shapeId: item.shapeId, cutscene: { ...item.cutscene, state: { ...item.cutscene.state } } }));
            setHasClipboard(true);
        }
    }, [timeline, validSelection]);

    const deleteSelection = useCallback(() => {
        if (validSelection.length) {
            commit(removeClips(timeline, validSelection));
            setSelection([]);
        }
    }, [commit, timeline, validSelection]);

    const pasteAt = useCallback((at: number, targetShapeId?: string) => {
        if (!clipboard.length) {
            return;
        }
        // one selected shape (or the row that was right-clicked) receives everything;
        // otherwise each clip goes back to the shape it was copied from
        const target = targetShapeId
            || (activeShapes.length === 1 && shapes[activeShapes[0]]?.render ? activeShapes[0] : null);
        const result = pasteClips(timeline, clipboard, at, item =>
            target || (shapes[item.shapeId]?.render ? item.shapeId : null)
        );
        if (result.pasted.length) {
            commit(result.timeline);
            setSelection(result.pasted);
        }
    }, [activeShapes, commit, shapes, timeline]);

    const duplicateSelection = useCallback(() => {
        const items = findClips(timeline, validSelection);
        if (!items.length) {
            return;
        }
        const after = Math.max(...items.map(item => item.cutscene.end));
        const result = pasteClips(timeline, items, after, item => item.shapeId);
        commit(result.timeline);
        setSelection(result.pasted);
    }, [commit, timeline, validSelection]);

    const nudgeSelection = useCallback((delta: number) => {
        if (!validSelection.length) {
            return;
        }
        const [lo, hi] = moveLimits(timeline, validSelection);
        const d = Math.min(hi, Math.max(lo, delta));
        const moved: TIME_DRAFT = {};
        findClips(timeline, validSelection).forEach(({ cutscene }) => {
            moved[cutscene.id] = { start: roundTime(cutscene.start + d), end: roundTime(cutscene.end + d) };
        });
        commit(applyDraft(timeline, moved));
    }, [commit, timeline, validSelection]);

    const editClip = useCallback((cutscene: CUTSCENE) => {
        seek(cutscene.end);
        startRecording();
    }, [seek]);

    const updateSelected = (patch: Partial<CUTSCENE>) => {
        singleSelected && commit(updateClip(timeline, { shapeId: singleSelected.shapeId, id: singleSelected.cutscene.id }, patch));
    };

    // ---------- pointer interactions

    const timeFromClientX = (clientX: number) => {
        const body = bodyRef.current!;
        const rect = body.getBoundingClientRect();
        return Math.max(0, (clientX - rect.left - LABEL_WIDTH + body.scrollLeft) / pps);
    };

    const startScrub = (e: React.PointerEvent, shapeId?: string) => {
        if (e.button !== 0 || recording) {
            return;
        }
        containerRef.current?.focus();
        setSelection([]);
        if (shapeId) {
            dispatch(setActiveShape([shapeId]));
        }
        seek(timeFromClientX(e.clientX));
        const onMove = (ev: PointerEvent) => seek(timeFromClientX(ev.clientX));
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
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

    const startClipDrag = (e: React.PointerEvent, shapeId: string, cutscene: CUTSCENE, mode: DRAG['mode']) => {
        if (e.button !== 0 || recording) {
            return;
        }
        e.stopPropagation();
        containerRef.current?.focus();
        const ref = { shapeId, id: cutscene.id };
        const isSelected = selectedIds.has(cutscene.id);
        let refs: CLIP_REF[];
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
            refs = isSelected ? validSelection.filter(r => r.id !== cutscene.id) : [...validSelection, ref];
            setSelection(refs);
            return;
        }
        refs = isSelected && mode === 'move' ? validSelection : [ref];
        setSelection(refs);
        dispatch(setActiveShape([shapeId]));

        const original: DRAG['original'] = {};
        findClips(timeline, refs).forEach(item => {
            original[item.cutscene.id] = { start: item.cutscene.start, end: item.cutscene.end };
        });
        dragRef.current = {
            mode,
            refs,
            primary: ref,
            pointerStartX: e.clientX,
            original,
            limits: mode === 'move' ? moveLimits(timeline, refs) : edgeLimits(timeline, ref, mode),
            edges: snapEdges(timeline, new Set(refs.map(r => r.id))),
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
                // snap whichever edge of the grabbed clip is closer to something
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
                commit(applyDraft(timeline, finalDraft));
            } else if (drag && !drag.moved && drag.refs.length > 1) {
                // plain click inside a multi-selection selects just that clip
                setSelection([drag.primary]);
            }
            setDraft(null);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    // menu items unmount on click, so hand keyboard focus back to the timeline for Del/⌘C etc.
    const closeMenu = () => {
        setMenu(null);
        containerRef.current?.focus();
    };

    const openMenu = (e: React.MouseEvent, shapeId: string, cutscene?: CUTSCENE) => {
        e.preventDefault();
        e.stopPropagation();
        if (recording) {
            return;
        }
        if (cutscene && !selectedIds.has(cutscene.id)) {
            setSelection([{ shapeId, id: cutscene.id }]);
        }
        setMenu({ x: e.clientX, y: e.clientY, shapeId, onClip: Boolean(cutscene) });
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

        if (recording) {
            if (e.key === 'Escape') cancelRecording();
            else if (e.key === 'Enter') commitRecording();
            else handled = false;
        }
        else if (key === ' ') togglePlay();
        else if (mod && key === 'c') copySelection();
        else if (mod && key === 'x') { copySelection(); deleteSelection(); }
        else if (mod && key === 'v') pasteAt(time);
        else if (mod && key === 'd') duplicateSelection();
        else if (mod && key === 'a') setSelection(rows.flatMap(id => (timeline[id]?.cutscenes || []).map(c => ({ shapeId: id, id: c.id }))));
        else if (e.key === 'Delete' || e.key === 'Backspace') deleteSelection();
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const step = (e.shiftKey ? 1 : 0.1) * (e.key === 'ArrowLeft' ? -1 : 1);
            validSelection.length ? nudgeSelection(step) : seek(time + step);
        }
        else if (e.key === 'Home') seek(0);
        else if (e.key === 'End') seek(duration);
        else if (e.key === 'Enter' && singleSelected) editClip(singleSelected.cutscene);
        else if (e.key === 'Escape') { setSelection([]); closeMenu(); }
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
            const t = roundTime(i * minorStep * 1000) / 1000;
            list.push({ t, major: i % 5 === 0 });
        }
        return list;
    }, [contentSeconds, minorStep]);

    const toolButton = (Icon: IconType, label: string, onClick: () => void, disabled = false, className = 'iconButton') => (
        <button className={className} onClick={onClick} disabled={disabled} title={label} aria-label={label}>
            <Icon />
        </button>
    );

    const canEditClips = !recording && validSelection.length > 0;

    return (
        <TimelineContainer
            ref={containerRef}
            className={collapsed ? 'collapsed' : ''}
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label='Animation timeline'
        >
            <Toolbar>
                {toolButton(playing ? BsPauseFill : BsPlayFill, playing ? 'Pause (Space)' : 'Play (Space)', togglePlay, timelinePlayer.isEmpty || Boolean(recording), 'iconButton play')}
                {toolButton(BsSkipStartFill, 'Back to start (Home)', () => seek(0), Boolean(recording))}
                <span className='time'>
                    {formatTime(time)} <span className='total'>/ {formatTime(duration)}</span>
                </span>
                <div className='divider' />
                {
                    recording
                        ? (
                            <>
                                <button className='textButton primary' onClick={() => commitRecording()}><BsCheckLg /> Done</button>
                                <button className='textButton' onClick={cancelRecording}><BsX /> Cancel</button>
                            </>
                        )
                        : (
                            <button className='textButton record' onClick={startRecording} title='Change shapes on the canvas and save them as animation ending at the playhead'>
                                <BsRecordCircle /> Record snapshot
                            </button>
                        )
                }
                <div className='divider' />
                {toolButton(BsFiles, `Copy (${MOD}C)`, copySelection, !canEditClips)}
                {toolButton(BsScissors, `Cut (${MOD}X)`, () => { copySelection(); deleteSelection(); }, !canEditClips)}
                {toolButton(BsClipboard, `Paste at playhead (${MOD}V)`, () => pasteAt(time), Boolean(recording) || !hasClipboard)}
                {toolButton(BsPencil, 'Edit selected animation (Enter)', () => singleSelected && editClip(singleSelected.cutscene), Boolean(recording) || !singleSelected)}
                {toolButton(BsTrash, 'Delete (Del)', deleteSelection, !canEditClips)}
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
                !collapsed && singleSelected && !recording
                    ? (
                        <Inspector>
                            <span className='title'>{shapes[singleSelected.shapeId]?.name}</span>
                            <label>
                                Start
                                <input
                                    type='number'
                                    step={0.1}
                                    min={0}
                                    value={singleSelected.cutscene.start}
                                    onChange={e => {
                                        const [lo, hi] = moveLimits(timeline, [{ shapeId: singleSelected.shapeId, id: singleSelected.cutscene.id }]);
                                        const c = singleSelected.cutscene;
                                        const delta = Math.min(hi, Math.max(lo, (Number(e.target.value) || 0) - c.start));
                                        updateSelected({ start: roundTime(c.start + delta), end: roundTime(c.end + delta) });
                                    }}
                                />
                            </label>
                            <label>
                                Duration
                                <input
                                    type='number'
                                    step={0.1}
                                    min={MIN_CUTSCENE_DURATION}
                                    value={roundTime(singleSelected.cutscene.end - singleSelected.cutscene.start)}
                                    onChange={e => {
                                        const c = singleSelected.cutscene;
                                        const [lo, hi] = edgeLimits(timeline, { shapeId: singleSelected.shapeId, id: c.id }, 'end');
                                        const end = Math.min(hi, Math.max(lo, c.start + (Number(e.target.value) || 0)));
                                        updateSelected({ end: roundTime(end) });
                                    }}
                                />
                            </label>
                            <label>
                                Easing
                                <select value={singleSelected.cutscene.ease} onChange={e => updateSelected({ ease: e.target.value })}>
                                    {EASES.map(ease => <option key={ease.value} value={ease.value}>{ease.label}</option>)}
                                </select>
                            </label>
                            <div className='chips'>
                                <span className='muted'>Animates</span>
                                {
                                    describeState(singleSelected.cutscene.state).map(group => (
                                        <span className='chip' key={group.label}>
                                            {group.label}
                                            <button
                                                title={`Stop animating ${group.label.toLowerCase()}`}
                                                onClick={() => {
                                                    const state = { ...singleSelected.cutscene.state };
                                                    group.keys.forEach(key => delete state[key]);
                                                    updateSelected({ state });
                                                }}
                                            >
                                                <BsX />
                                            </button>
                                        </span>
                                    ))
                                }
                                {Object.keys(singleSelected.cutscene.state).length === 0 ? <span className='muted'>nothing yet</span> : null}
                            </div>
                        </Inspector>
                    )
                    : null
            }

            {
                !collapsed
                    ? (
                        <Body ref={bodyRef} className={recording ? 'recording' : ''}>
                            <div className='content' style={{ width: LABEL_WIDTH + contentWidth }}>
                                <div className='ruler'>
                                    <div className='corner'>Layers</div>
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
                                    rows.length === 0
                                        ? (
                                            <div className='empty' style={{ width: viewportWidth + LABEL_WIDTH }}>
                                                <b>No animations yet</b>
                                                <span>Move the playhead, press <b>Record snapshot</b>, then move, resize or recolor shapes. Press Done to turn the changes into animation.</span>
                                            </div>
                                        )
                                        : null
                                }

                                {
                                    rows.map((shapeId, rowIndex) => {
                                        const color = ROW_COLORS[rowIndex % ROW_COLORS.length];
                                        const cutscenes = shownTimeline[shapeId]?.cutscenes || [];
                                        return (
                                            <div key={shapeId} className={`row${activeShapes.includes(shapeId) ? ' active' : ''}`}>
                                                <div className='label' onClick={() => !recording && dispatch(setActiveShape([shapeId]))} title={shapes[shapeId].name}>
                                                    <span className='swatch' style={{ backgroundColor: color }} />
                                                    <span className='name'>{shapes[shapeId].name}</span>
                                                    {cutscenes.length ? <span className='count'>{cutscenes.length}</span> : null}
                                                </div>
                                                <div
                                                    className='track'
                                                    style={{ width: contentWidth, backgroundSize: `${majorStep * pps}px 100%` }}
                                                    onPointerDown={e => startScrub(e, shapeId)}
                                                    onContextMenu={e => openMenu(e, shapeId)}
                                                >
                                                    {
                                                        cutscenes.map(cutscene => {
                                                            const labels = describeState(cutscene.state).map(group => group.label).join(' · ') || 'No changes';
                                                            const selected = selectedIds.has(cutscene.id);
                                                            return (
                                                                <div
                                                                    key={cutscene.id}
                                                                    className={`clip${selected ? ' selected' : ''}${draft?.[cutscene.id] ? ' dragging' : ''}`}
                                                                    style={{
                                                                        left: cutscene.start * pps,
                                                                        width: Math.max(6, (cutscene.end - cutscene.start) * pps),
                                                                        backgroundColor: color,
                                                                    }}
                                                                    title={`${labels}\n${formatTime(cutscene.start)} → ${formatTime(cutscene.end)} · double-click to edit`}
                                                                    onPointerDown={e => startClipDrag(e, shapeId, cutscene, 'move')}
                                                                    onDoubleClick={() => editClip(cutscene)}
                                                                    onContextMenu={e => openMenu(e, shapeId, cutscene)}
                                                                >
                                                                    <span className='clipLabel'>{labels}</span>
                                                                    <span className='handle start' onPointerDown={e => startClipDrag(e, shapeId, cutscene, 'start')} />
                                                                    <span className='handle end' onPointerDown={e => startClipDrag(e, shapeId, cutscene, 'end')} />
                                                                </div>
                                                            );
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })
                                }

                                <div className='playhead' style={{ left: LABEL_WIDTH + (recording ? recording.time : time) * pps }} />
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
                                            <button disabled={!singleSelected} onClick={() => { singleSelected && editClip(singleSelected.cutscene); closeMenu(); }}>
                                                <BsPencil /> Edit animation <span className='shortcut'>Enter</span>
                                            </button>
                                            <div className='separator' />
                                            <button onClick={() => { copySelection(); closeMenu(); }}><BsFiles /> Copy <span className='shortcut'>{MOD}C</span></button>
                                            <button onClick={() => { copySelection(); deleteSelection(); closeMenu(); }}><BsScissors /> Cut <span className='shortcut'>{MOD}X</span></button>
                                            <button onClick={() => { duplicateSelection(); closeMenu(); }}><BsFiles /> Duplicate <span className='shortcut'>{MOD}D</span></button>
                                        </>
                                    )
                                    : null
                            }
                            <button disabled={!hasClipboard} onClick={() => { pasteAt(time, menu.shapeId); closeMenu(); }}>
                                <BsClipboard /> Paste at playhead <span className='shortcut'>{MOD}V</span>
                            </button>
                            {
                                menu.onClip
                                    ? (
                                        <>
                                            <div className='separator' />
                                            <button className='danger' onClick={() => { deleteSelection(); closeMenu(); }}><BsTrash /> Delete <span className='shortcut'>Del</span></button>
                                        </>
                                    )
                                    : null
                            }
                        </ClipMenu>
                    )
                    : null
            }
        </TimelineContainer>
    );
}

export default Timeline;
