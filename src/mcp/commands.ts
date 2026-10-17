import store, { State } from '../store/store';
import { db } from '../db/db';
import projects, { personalProjectIds } from '../seed';
import {
    addGradientInPalette,
    addPage,
    addShape,
    createNewFile,
    editSvgStyle,
    formatActiveShape,
    removeSelectedShapes,
    saveFile,
    saveFileAS,
    saveSelectedShapesAsGroup,
    setActivePage,
    setActiveShape,
    setPageTimelines,
} from '../actions/pages/pages.actions';
import { setPlayback, setTimelineSelection } from '../actions/timeline/timeline.actions';
import { FORMAT_ACTIVE_SHAPE_PAYLOAD, GRADIENT, PAGES } from '../actions/pages/pages.interface';
import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { GROUP_SHAPE } from '../shapes/group';
import { getBaseToolDefaultProps } from '../shapes/baseShapes';
import { SHAPE_TYPES } from '../utils/constant';
import { getPageTimelines, getShapesOfCurrentPage } from '../selector/selector';
import { createTimeline, cutsceneAt, findCutscene, orderedCutscenes } from '../timeline/model';
import { addCutscene, nextTimelineName, roundTime, updateClip } from '../timeline/clipOps';
import { enterCutscene, exitCutscene, setTransition, showTimeOnCanvas } from '../timeline/editing';
import { timelinePlayer } from '../timeline/player';
import { CLIP_REF, CUTSCENE, MIN_CUTSCENE_DURATION, TRANSITION } from '../timeline/timeline.types';

/** Shape type names used over MCP, mapped to the editor's own. */
const SHAPE_TYPE_NAMES: { [name: string]: SHAPE_TYPES } = {
    circle: SHAPE_TYPES.CIRCLE,
    rectangle: SHAPE_TYPES.RECTANGLE,
    ellipse: SHAPE_TYPES.ELLIPSE,
    line: SHAPE_TYPES.LINE,
    polyline: SHAPE_TYPES.POLYLINE,
    polygon: SHAPE_TYPES.POLYGON,
    path: SHAPE_TYPES.PATH,
    text: SHAPE_TYPES.TEXT,
    image: SHAPE_TYPES.IMAGE,
    group: SHAPE_TYPES.GROUP,
};
const typeName = (type: SHAPE_TYPES) => Object.keys(SHAPE_TYPE_NAMES).find(name => SHAPE_TYPE_NAMES[name] === type) || type;

const EDITOR_PATH = '/editor';
const DEFAULT_STYLE = getBaseToolDefaultProps({ type: SHAPE_TYPES.RECTANGLE, x: 0, y: 0 }).style;

class CommandError extends Error { }

type Params = { [key: string]: any };

const state = () => store.getState() as State;
const currentPage = () => state().page.pages[state().page.activePageIndex];
// background tabs (the usual case while an agent works) don't run animation frames, so fall back to a timer
const nextFrame = () => new Promise(resolve => {
    const timer = setTimeout(resolve, 50);
    requestAnimationFrame(() => {
        clearTimeout(timer);
        resolve(undefined);
    });
});
/** lets React commit and run effects (bounding boxes, timeline sync) after a dispatch */
const settle = async () => { await nextFrame(); await nextFrame(); };

async function waitFor(check: () => boolean, what: string, timeoutMs = 5000) {
    const start = Date.now();
    while (!check()) {
        if (Date.now() - start > timeoutMs) {
            throw new CommandError(`Timed out waiting for ${what}.`);
        }
        await nextFrame();
    }
}

const editorReady = () => window.location.pathname === EDITOR_PATH
    && Boolean(document.getElementById('svgEditor'))
    && Boolean(state().timeline.editing);

/**
 * Shape edits are saved into the cutscene open on the canvas, so make sure one is open:
 * stop playback and reopen the selected cutscene (or the one under the playhead) if needed.
 */
function requireEditing() {
    if (window.location.pathname !== EDITOR_PATH) {
        throw new CommandError('No document is open in the editor; the project list is showing. Call new_document or open_document first.');
    }
    const { timeline } = state();
    if (timeline.editing) {
        return timeline.editing;
    }
    timelinePlayer.pause();
    store.dispatch(setPlayback({ playing: false }));
    const tracks = getPageTimelines(state());
    const selected = timeline.selection[timeline.selection.length - 1];
    const ref: CLIP_REF = selected && findCutscene(tracks, selected.timelineId, selected.id)
        ? selected
        : { timelineId: tracks[0].id, id: cutsceneAt(tracks[0], timeline.time).id };
    store.dispatch(setTimelineSelection([ref]));
    enterCutscene(ref);
    const editing = state().timeline.editing;
    if (!editing) {
        throw new CommandError('Could not open a cutscene for editing.');
    }
    return editing;
}

function getShape(id: string): AVAILABLE_SHAPES {
    const shape = getShapesOfCurrentPage(state())[id];
    if (!shape) {
        throw new CommandError(`No shape with id "${id}" on the current page.`);
    }
    return shape;
}

function requireUnlocked(ids: string[]) {
    const locked = state().timeline.editing?.locked || [];
    const blocked = ids.filter(id => locked.includes(id));
    if (blocked.length) {
        throw new CommandError(`Shapes ${blocked.join(', ')} belong to another timeline; open a cutscene of that timeline (open_cutscene) to edit them.`);
    }
}

/** Rectangles start with ry 0, which SVG draws as square corners, so a lone rx sets both radii. */
function withCornerRadii(properties: Params) {
    return properties.rx !== undefined && properties.ry === undefined ? { ...properties, ry: properties.rx } : properties;
}

/** A shape without the style values every new shape starts with, and with long image data cut short. */
function summarizeShape(shape: AVAILABLE_SHAPES) {
    const { style, pageId, x_unit, y_unit, ...rest } = shape as any;
    const summary: any = { ...rest, type: typeName(shape.type) };
    Object.keys(summary).forEach(key => {
        if (key.endsWith('_unit')) {
            delete summary[key];
        }
    });
    if (typeof summary.base64Url === 'string' && summary.base64Url.length > 120) {
        summary.base64Url = `${summary.base64Url.slice(0, 60)}… (${summary.base64Url.length} chars)`;
    }
    const changedStyle: any = {};
    Object.keys(style).forEach(key => {
        if (JSON.stringify(style[key]) !== JSON.stringify((DEFAULT_STYLE as any)[key])) {
            changedStyle[key] = style[key];
        }
    });
    summary.style = changedStyle;
    return summary;
}

function editingInfo() {
    const editing = state().timeline.editing;
    if (!editing) {
        return null;
    }
    const tracks = getPageTimelines(state());
    const track = tracks.find(t => t.id === editing.timelineId);
    const cutscene = findCutscene(tracks, editing.timelineId, editing.cutsceneId);
    return {
        timelineId: editing.timelineId,
        timelineName: track?.name,
        cutsceneId: editing.cutsceneId,
        cutsceneName: cutscene?.name,
        lockedShapeIds: editing.locked,
    };
}

function canvasSize() {
    const svg = document.getElementById('svgEditor');
    const rect = svg?.getBoundingClientRect();
    return { width: Math.round(rect?.width || 0), height: Math.round(rect?.height || 0) };
}

// ---------- svg output

/** The canvas as a standalone svg: defs and shapes only, without editor overlays. */
function canvasSvg() {
    const svg = document.getElementById('svgEditor') as SVGSVGElement | null;
    if (!svg) {
        throw new CommandError('The canvas is not on screen.');
    }
    const { width, height } = canvasSize();
    const clone = svg.cloneNode(true) as SVGSVGElement;
    // shapes are top-level elements carrying their shape id; anything else is an editor helper
    const shapeIds = new Set(Object.keys(state().timeline.preview || getShapesOfCurrentPage(state())));
    Array.from(clone.children).forEach(child => {
        if (child.tagName.toLowerCase() !== 'defs' && !shapeIds.has(child.id)) {
            child.remove();
        }
    });
    clone.querySelectorAll('[class]').forEach(el => el.removeAttribute('class'));
    ['id', 'class', 'data-tool', 'style'].forEach(attr => clone.removeAttribute(attr));
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const background = currentPage().svgStyle.backgroundColor;
    clone.setAttribute('style', `background-color: ${background}`);
    return { markup: new XMLSerializer().serializeToString(clone), width, height, background };
}

async function svgToPng(markup: string, width: number, height: number, background: string, scale: number) {
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d')!;
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png').split(',')[1];
}

// ---------- commands

type Command = (params: Params) => unknown;

export function createCommands(navigate: (path: string) => void): { [method: string]: Command } {

    async function openInEditor(doc?: PAGES) {
        // leave the editor first so its timeline closes the old document cleanly, then load the new one
        if (window.location.pathname === EDITOR_PATH) {
            navigate('/');
            await settle();
        }
        store.dispatch(createNewFile(doc));
        navigate(EDITOR_PATH);
        await waitFor(editorReady, 'the editor to open the document');
        await settle();
    }

    return {
        status() {
            const { page } = state();
            return {
                route: window.location.pathname,
                documentOpen: window.location.pathname === EDITOR_PATH,
                document: { id: page.id, name: page.name },
                activePageIndex: page.activePageIndex,
                editing: editingInfo(),
            };
        },

        getDocument({ includeShapes = true }) {
            requireEditing();
            const { page } = state();
            const shapes = getShapesOfCurrentPage(state());
            const pageInfo = currentPage();
            return {
                id: page.id,
                name: page.name,
                activePageIndex: page.activePageIndex,
                pageCount: page.pages.length,
                canvas: { ...pageInfo.svgStyle, pixelSize: canvasSize() },
                gradients: Object.keys(page.gradients).map(id => ({ id, fill: `url(#${id})`, ...page.gradients[id] })),
                selection: pageInfo.activeShapes,
                editing: editingInfo(),
                shapeCount: Object.keys(shapes).length,
                shapes: includeShapes ? Object.values(shapes).map(summarizeShape) : undefined,
            };
        },

        getShape({ id }) {
            requireEditing();
            return getShape(id);
        },

        addShape({ type, x = 0, y = 0, points, src, properties = {}, style }) {
            requireEditing();
            const shapeType = SHAPE_TYPE_NAMES[type];
            if (!shapeType || shapeType === SHAPE_TYPES.GROUP) {
                throw new CommandError(`Unknown shape type "${type}". Use group_shapes to make groups.`);
            }
            if ([SHAPE_TYPES.LINE, SHAPE_TYPES.POLYLINE, SHAPE_TYPES.POLYGON, SHAPE_TYPES.PATH].includes(shapeType) && !(points?.length >= 2)) {
                throw new CommandError(`A ${type} needs at least two points.`);
            }
            const action = addShape({ shape: shapeType, x, y, pointsArray: points, src });
            if (!action) {
                throw new CommandError(`Could not create a ${type}.`);
            }
            store.dispatch(action);
            const id = action.payload.id;
            if (Object.keys(properties).length || style) {
                store.dispatch(formatActiveShape({ id, properties: withCornerRadii(properties), style }));
            }
            return summarizeShape(getShape(id));
        },

        updateShape({ id, properties = {}, style }) {
            requireEditing();
            requireUnlocked([id]);
            getShape(id);
            const payload: FORMAT_ACTIVE_SHAPE_PAYLOAD = { id, properties: withCornerRadii(properties), style };
            store.dispatch(formatActiveShape(payload));
            return summarizeShape(getShape(id));
        },

        deleteShapes({ ids }) {
            requireEditing();
            requireUnlocked(ids);
            const shapes = getShapesOfCurrentPage(state());
            const toDelete = new Set<string>();
            // a group's children are hidden shapes of their own; remove them with the group
            const collect = (id: string) => {
                toDelete.add(id);
                const shape = shapes[id];
                if (shape?.type === SHAPE_TYPES.GROUP) {
                    (shape as GROUP_SHAPE).children.forEach(collect);
                }
            };
            ids.forEach((id: string) => { getShape(id); collect(id); });
            store.dispatch(setActiveShape(Array.from(toDelete).filter(id => shapes[id])));
            store.dispatch(removeSelectedShapes());
            return { deleted: Array.from(toDelete) };
        },

        selectShapes({ ids }) {
            requireEditing();
            ids.forEach(getShape);
            store.dispatch(setActiveShape(ids));
            return { selection: ids };
        },

        groupShapes({ ids, name }) {
            requireEditing();
            requireUnlocked(ids);
            ids.forEach((id: string) => {
                if (!getShape(id).render) {
                    throw new CommandError(`Shape "${id}" is already inside a group.`);
                }
            });
            store.dispatch(setActiveShape(ids));
            store.dispatch(saveSelectedShapesAsGroup());
            const groupId = currentPage().activeShapes[0];
            if (name) {
                store.dispatch(formatActiveShape({ id: groupId, properties: { name } }));
            }
            return summarizeShape(getShape(groupId));
        },

        setCanvas({ backgroundColor, width, height }) {
            requireEditing();
            const style: { [key: string]: string | number } = {};
            if (backgroundColor !== undefined) style.backgroundColor = backgroundColor;
            if (width !== undefined) style.width = width;
            if (height !== undefined) style.height = height;
            store.dispatch(editSvgStyle(style));
            return { ...currentPage().svgStyle, pixelSize: canvasSize() };
        },

        addPage() {
            requireEditing();
            store.dispatch(addPage());
            return { activePageIndex: state().page.activePageIndex, pageCount: state().page.pages.length };
        },

        async setActivePage({ index }) {
            requireEditing();
            if (!state().page.pages[index]) {
                throw new CommandError(`No page ${index}; the document has ${state().page.pages.length} page(s), numbered from 0.`);
            }
            store.dispatch(setActivePage(index));
            await waitFor(() => Boolean(state().timeline.editing), 'the page to open');
            return { activePageIndex: index };
        },

        addGradient(gradient) {
            requireEditing();
            const before = new Set(Object.keys(state().page.gradients));
            store.dispatch(addGradientInPalette({
                spreadMethod: 'pad', rotate: 0, skewX: 0, skewY: 0, cx: 50, cy: 50, fx: 50, fy: 50, fr: 0,
                ...gradient,
            } as GRADIENT));
            const id = Object.keys(state().page.gradients).find(key => !before.has(key))!;
            return { id, fill: `url(#${id})` };
        },

        async exportSvg() {
            requireEditing();
            await settle();
            return { svg: canvasSvg().markup };
        },

        async screenshot({ scale = 1, time }) {
            requireEditing();
            if (time === undefined) {
                await settle();
                const { markup, width, height, background } = canvasSvg();
                return { png: await svgToPng(markup, width, height, background, scale), width, height };
            }
            // show the animation at `time` (view-only), capture it, then reopen the cutscene being edited
            const { timelineId, cutsceneId } = state().timeline.editing!;
            exitCutscene(false);
            try {
                showTimeOnCanvas(Math.max(0, roundTime(time)));
                await settle();
                const { markup, width, height, background } = canvasSvg();
                return { png: await svgToPng(markup, width, height, background, scale), width, height };
            } finally {
                enterCutscene({ timelineId, id: cutsceneId });
            }
        },

        // ---------- documents

        async listDocuments() {
            const saved = await db.doc.toArray();
            const examples = Object.values(projects) as unknown as PAGES[];
            return {
                saved: saved.map(doc => ({ id: doc.id, name: doc.name, pageCount: doc.pages.length })),
                examples: examples.map(doc => ({ id: doc.id, name: doc.name, pageCount: doc.pages.length })),
            };
        },

        async openDocument({ id }) {
            const saved = await db.doc.where('id').equals(id).first();
            const doc = saved || (Object.values(projects) as unknown as PAGES[]).find(p => p.id === id);
            if (!doc) {
                throw new CommandError(`No document with id "${id}". Call list_documents to see what exists.`);
            }
            await openInEditor(doc);
            return this.status({});
        },

        async newDocument({ document }) {
            await openInEditor(document);
            return this.status({});
        },

        saveDocument({ name }) {
            requireEditing();
            const { page } = state();
            const canOverwrite = page.name.length > 0 && !personalProjectIds.includes(page.id);
            if (name || !canOverwrite) {
                if (!name) {
                    throw new CommandError('This document has never been saved (or is a built-in example); pass a name to save it as a new document.');
                }
                store.dispatch(saveFileAS(name));
            } else {
                store.dispatch(saveFile());
            }
            return { id: state().page.id, name: state().page.name };
        },

        // ---------- timelines

        getTimelines() {
            requireEditing();
            return {
                editing: editingInfo(),
                timelines: getPageTimelines(state()).map(track => ({
                    id: track.id,
                    name: track.name,
                    cutscenes: orderedCutscenes(track).map(c => ({
                        id: c.id,
                        name: c.name,
                        start: c.start,
                        end: c.end,
                        ease: c.ease,
                        isDefault: Boolean(c.isDefault),
                        added: Object.keys(c.added),
                        changed: Object.keys(c.changed).map(id => ({ id, keys: describePatch(c.changed[id]) })),
                        removed: c.removed,
                        enter: c.enter,
                        exit: c.exit,
                    })),
                })),
            };
        },

        addTimeline({ name }) {
            requireEditing();
            const tracks = getPageTimelines(state());
            const track = createTimeline(name || nextTimelineName(tracks));
            store.dispatch(setPageTimelines([...tracks, track]));
            const ref = { timelineId: track.id, id: track.cutscenes[0].id };
            openCutscene(ref);
            return { timelineId: track.id, cutsceneId: ref.id, editing: editingInfo() };
        },

        addCutscene({ timelineId, name, duration, ease }) {
            const editing = requireEditing();
            const tracks = getPageTimelines(state());
            const targetId = timelineId || editing.timelineId;
            if (!tracks.some(t => t.id === targetId)) {
                throw new CommandError(`No timeline with id "${targetId}".`);
            }
            const result = addCutscene(tracks, targetId);
            const added = findCutscene(result.tracks, targetId, result.ref.id)!;
            const patch: Partial<CUTSCENE> = {};
            if (name) patch.name = name;
            if (ease) patch.ease = ease;
            if (duration) patch.end = roundTime(added.start + Math.max(MIN_CUTSCENE_DURATION, duration));
            store.dispatch(setPageTimelines(updateClip(result.tracks, result.ref, patch)));
            openCutscene(result.ref);
            return { timelineId: targetId, cutsceneId: result.ref.id, editing: editingInfo() };
        },

        openCutscene({ timelineId, cutsceneId }) {
            requireEditing();
            if (!findCutscene(getPageTimelines(state()), timelineId, cutsceneId)) {
                throw new CommandError(`No cutscene "${cutsceneId}" in timeline "${timelineId}".`);
            }
            openCutscene({ timelineId, id: cutsceneId });
            return { editing: editingInfo() };
        },

        updateCutscene({ timelineId, cutsceneId, name, start, end, ease }) {
            requireEditing();
            const tracks = getPageTimelines(state());
            const track = tracks.find(t => t.id === timelineId);
            const cutscene = findCutscene(tracks, timelineId, cutsceneId);
            if (!track || !cutscene) {
                throw new CommandError(`No cutscene "${cutsceneId}" in timeline "${timelineId}".`);
            }
            const next = {
                start: start !== undefined ? roundTime(start) : cutscene.start,
                end: end !== undefined ? roundTime(end) : cutscene.end,
            };
            if (next.start < 0 || next.end - next.start < MIN_CUTSCENE_DURATION) {
                throw new CommandError(`A cutscene must start at 0 or later and last at least ${MIN_CUTSCENE_DURATION}s.`);
            }
            const overlap = track.cutscenes.find(c => c.id !== cutsceneId && c.start < next.end && next.start < c.end);
            if (overlap) {
                throw new CommandError(`That would overlap "${overlap.name}" (${overlap.start}s–${overlap.end}s); cutscenes in one timeline can't overlap.`);
            }
            const patch: Partial<CUTSCENE> = { ...next };
            if (name !== undefined) patch.name = name;
            if (ease !== undefined) patch.ease = ease;
            store.dispatch(setPageTimelines(updateClip(tracks, { timelineId, id: cutsceneId }, patch)));
            return { ...findCutscene(getPageTimelines(state()), timelineId, cutsceneId), added: undefined, changed: undefined };
        },

        setTransition({ shapeId, kind, transition }) {
            const editing = requireEditing();
            const cutscene = findCutscene(getPageTimelines(state()), editing.timelineId, editing.cutsceneId)!;
            const list = kind === 'enter' ? Object.keys(cutscene.added) : cutscene.removed;
            if (!list.includes(shapeId)) {
                throw new CommandError(kind === 'enter'
                    ? `Shape "${shapeId}" doesn't appear in the open cutscene "${cutscene.name}"; only shapes added in a cutscene have an entry animation.`
                    : `Shape "${shapeId}" isn't removed in the open cutscene "${cutscene.name}"; only shapes deleted in a cutscene have an exit animation.`);
            }
            setTransition(shapeId, kind, transition as TRANSITION);
            return { cutsceneId: cutscene.id, shapeId, kind, transition };
        },
    };
}

/** Selects a cutscene in the timeline panel and loads it onto the canvas, as clicking it does. */
function openCutscene(ref: CLIP_REF) {
    store.dispatch(setTimelineSelection([ref]));
    enterCutscene(ref);
}

function describePatch(patch: { [key: string]: any }) {
    const { style, ...rest } = patch;
    return [...Object.keys(rest), ...Object.keys(style || {}).map(key => `style.${key}`)];
}

export { CommandError };
