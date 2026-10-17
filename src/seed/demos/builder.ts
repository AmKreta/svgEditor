import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import { STYLE } from '../../shapes/style';
import { GRADIENT, PAGES } from '../../actions/pages/pages.interface';
import { SHAPE_TYPES } from '../../utils/constant';
import generateId from '../../utils/idGenerator';
import { applyCutscene, DEFAULT_CUTSCENE_NAME, emptyCutscene } from '../../timeline/model';
import { TimelinePlayer } from '../../timeline/player';
import { gradientDefs, shapesToMarkup } from '../../timeline/svgMarkup';
import { CUTSCENE, DEFAULT_EASE, SHAPES_STATE, SHAPE_PATCH, TIMELINE_TRACK, TRANSITION } from '../../timeline/timeline.types';

/*
 * A small DSL for writing demo documents in code: shapes come from the editor's own default
 * props, and each timeline is written as a list of cutscenes, like the editor stores them.
 */

type POINT = [number, number];
type STYLE_IN = Partial<STYLE>;

/*
 * Shapes are built as plain data with the same defaults the editor uses. The shape component
 * modules aren't imported: loading them from here (outside the editor) causes an import cycle.
 */
function base(type: SHAPE_TYPES, name: string, x: number, y: number, style: STYLE_IN): any {
    return {
        id: generateId(),
        name,
        type,
        x,
        y,
        x_unit: 'px',
        y_unit: 'px',
        render: true,
        style: {
            opacity: 1,
            fill: 'transparent',
            fillOpacity: 1,
            fillRule: 'nonzero',
            // filled shapes have no outline unless a stroke is given
            stroke: 'transparent',
            strokeWidth: 0,
            strokeWidth_unit: 'px',
            strokeDasharray: [],
            strokeDashoffset: 0,
            strokeLinecap: 'square',
            strokeOpacity: 1,
            strokeLinejoin: 'miter',
            strokeMitterlimit: 4,
            rotate: 0,
            translate: [0, 0],
            skewX: 0,
            skewY: 0,
            scale: [1, 1],
            cssFilters: {},
            svgFilters: {},
            ...style,
        },
    };
}

const px = { height_unit: 'px', width_unit: 'px' };

export const shapes = {
    rect: (name: string, x: number, y: number, width: number, height: number, style: STYLE_IN, extra: object = {}): AVAILABLE_SHAPES =>
        ({ ...base(SHAPE_TYPES.RECTANGLE, name, x, y, style), width, height, ...px, rx: 0, ry: 0, ...extra }),
    circle: (name: string, x: number, y: number, radius: number, style: STYLE_IN): AVAILABLE_SHAPES =>
        ({ ...base(SHAPE_TYPES.CIRCLE, name, x, y, style), radius, radius_unit: 'px' }),
    ellipse: (name: string, x: number, y: number, radiusX: number, radiusY: number, style: STYLE_IN): AVAILABLE_SHAPES =>
        ({ ...base(SHAPE_TYPES.ELLIPSE, name, x, y, style), radiusX, radiusX_unit: 'px', radiusY, radiusY_unit: 'px' }),
    polygon: (name: string, points: POINT[], style: STYLE_IN): AVAILABLE_SHAPES =>
        ({ ...base(SHAPE_TYPES.POLYGON, name, 0, 0, style), points }),
    polyline: (name: string, points: POINT[], style: STYLE_IN): AVAILABLE_SHAPES =>
        ({ ...base(SHAPE_TYPES.POLYLINE, name, 0, 0, style), points }),
    line: (name: string, from: POINT, to: POINT, style: STYLE_IN): AVAILABLE_SHAPES =>
        ({ ...base(SHAPE_TYPES.LINE, name, 0, 0, style), points: [from, to] }),
    path: (name: string, points: POINT[], style: STYLE_IN): AVAILABLE_SHAPES =>
        ({ ...base(SHAPE_TYPES.PATH, name, 0, 0, style), points }),
    text: (name: string, text: string, x: number, y: number, fontSize: number, style: STYLE_IN, extra: object = {}): AVAILABLE_SHAPES =>
        ({
            ...base(SHAPE_TYPES.TEXT, name, x, y, style),
            text,
            fontSize,
            fontWeight: 700,
            fontStyle: 'normal',
            fontFamily: 'Helvetica Neue',
            genericFontFamily: 'sans-serif',
            ...extra,
        }),
};

/** x for left-aligned text so it looks centred on `cx` (text has no anchor option in the editor). */
export const centredX = (text: string, fontSize: number, cx: number) => cx - text.length * fontSize * 0.29;

/** Deterministic random numbers so generated scenes look the same every time. */
export function random(seed: number) {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** A heart outline as two cubic curves, for path shapes. */
export function heartPoints(cx: number, cy: number, size: number): POINT[] {
    const k = size / 50;
    return ([[0, 30], [-50, -10], [-20, -50], [0, -20], [20, -50], [50, -10], [0, 30]] as POINT[])
        .map(([x, y]) => [cx + x * k, cy + y * k] as POINT);
}

// ---------- changes, written relative to a shape's state when the cutscene starts

export type CHANGE = SHAPE_PATCH | ((shape: AVAILABLE_SHAPES) => SHAPE_PATCH);

export const moveBy = (dx: number, dy = 0): CHANGE => shape =>
    ({ style: { translate: [shape.style.translate[0] + dx, shape.style.translate[1] + dy] } });
export const moveTo = (x: number, y: number): CHANGE => ({ style: { translate: [x, y] } });
export const rotateBy = (degrees: number): CHANGE => shape => ({ style: { rotate: shape.style.rotate + degrees } });
export const scaleTo = (k: number): CHANGE => ({ style: { scale: [k, k] } });
export const fadeTo = (opacity: number): CHANGE => ({ style: { opacity } });
export const fillTo = (fill: string): CHANGE => ({ style: { fill } });
export const all = (...changes: CHANGE[]): CHANGE => shape => {
    const patch: SHAPE_PATCH = {};
    let current = shape;
    changes.forEach(change => {
        const p = typeof change === 'function' ? change(current) : change;
        Object.assign(patch, { ...p, style: { ...(patch.style || {}), ...(p.style || {}) } });
        current = { ...current, ...p, style: { ...current.style, ...(p.style || {}) } } as AVAILABLE_SHAPES;
    });
    return patch;
};

type SHAPE_OR_ID = AVAILABLE_SHAPES | string;
const idOf = (s: SHAPE_OR_ID) => typeof s === 'string' ? s : s.id;

export interface CUTSCENE_SPEC {
    add?: Array<AVAILABLE_SHAPES | [AVAILABLE_SHAPES, TRANSITION]>;
    change?: Array<[SHAPE_OR_ID | SHAPE_OR_ID[], CHANGE]>;
    remove?: Array<SHAPE_OR_ID | [SHAPE_OR_ID, TRANSITION]>;
    ease?: string;
}

export class TrackBuilder {
    readonly track: TIMELINE_TRACK;
    private state: SHAPES_STATE = {};

    constructor(name: string, startShapes: AVAILABLE_SHAPES[], startEnd = 0.1) {
        const start = emptyCutscene({ name: DEFAULT_CUTSCENE_NAME, start: 0, end: startEnd, isDefault: true });
        startShapes.forEach(shape => {
            start.added[shape.id] = shape;
            start.enter[shape.id] = 'none';
        });
        this.track = { id: generateId(), name, cutscenes: [start] };
        this.state = applyCutscene({}, start);
    }

    /** Appends a cutscene; shapes must exist in the timeline before they're changed or removed. */
    cutscene(name: string, start: number, end: number, spec: CUTSCENE_SPEC): this {
        const cutscene: CUTSCENE = emptyCutscene({ name, start, end, ease: spec.ease || DEFAULT_EASE });
        (spec.remove || []).forEach(item => {
            const [target, type] = Array.isArray(item) ? item : [item, 'fade' as TRANSITION];
            cutscene.removed.push(idOf(target));
            cutscene.exit[idOf(target)] = type;
        });
        (spec.add || []).forEach(item => {
            const [shape, type] = Array.isArray(item) ? item : [item, 'fade' as TRANSITION];
            cutscene.added[shape.id] = shape;
            cutscene.enter[shape.id] = type;
        });
        (spec.change || []).forEach(([targets, change]) => {
            (Array.isArray(targets) ? targets : [targets]).forEach(target => {
                const id = idOf(target);
                const current = this.state[id];
                if (!current) {
                    throw new Error(`Demo "${this.track.name}" / ${name}: ${id} isn't on screen`);
                }
                const patch = typeof change === 'function' ? change(current) : change;
                const previous = cutscene.changed[id] || {};
                cutscene.changed[id] = { ...previous, ...patch, style: { ...(previous.style || {}), ...(patch.style || {}) } };
            });
        });
        this.track.cutscenes.push(cutscene);
        this.state = applyCutscene(this.state, cutscene);
        return this;
    }

    /** The timeline's shapes as they are after the last cutscene so far. */
    get current() {
        return this.state;
    }
}

export interface DEMO_SPEC {
    id: string;
    name: string;
    background: string;
    gradients?: { [id: string]: GRADIENT };
    colors?: string[];
    loop?: boolean;
    /** moment used for the static thumbnail */
    posterTime: number;
    tracks: TrackBuilder[];
}

/** A complete document the editor can open, with a thumbnail of `posterTime`. */
export function buildDemo(spec: DEMO_SPEC): PAGES {
    const timelines = spec.tracks.map(t => t.track);
    const startShapes: SHAPES_STATE = {};
    timelines.forEach(track => Object.assign(startShapes, track.cutscenes[0].added));

    const player = new TimelinePlayer();
    player.sync(timelines);
    const poster = gradientDefs(spec.gradients || {}) + shapesToMarkup(player.evaluate(spec.posterTime));

    const colors: { [id: string]: string } = {};
    (spec.colors || []).forEach(color => {
        colors[generateId()] = color;
    });

    return {
        activePageIndex: 0,
        activeTool: SHAPE_TYPES.PAN,
        hoveredShapeId: null,
        contextMenu: { show: false, x: 0, y: 0, clipboard: { x: 0, y: 0 } },
        clipboard: [],
        colors,
        gradients: spec.gradients || {},
        images: {},
        name: spec.name,
        id: spec.id,
        snapshots: [poster],
        pages: [{
            id: `${spec.id}-page-1`,
            activeShapes: [],
            shapes: startShapes,
            filters: {},
            renderTree: [],
            svgStyle: { backgroundColor: spec.background, height: 100, width: 100 },
            timelines,
            loop: spec.loop,
        }],
    };
}

/** Linear gradient from top to bottom. */
export function verticalGradient(stops: Array<[string, number, number?]>): GRADIENT {
    return {
        type: 'linear',
        rotate: 90,
        skewX: 0,
        skewY: 0,
        stops: stops.map(([stopColor, offset, stopOpacity = 1]) => ({ stopColor, offset, stopOpacity })),
    };
}

export function radialGradient(stops: Array<[string, number, number?]>): GRADIENT {
    return {
        type: 'radial',
        rotate: 0,
        skewX: 0,
        skewY: 0,
        cx: 50,
        cy: 50,
        fx: 50,
        fy: 50,
        fr: 0,
        stops: stops.map(([stopColor, offset, stopOpacity = 1]) => ({ stopColor, offset, stopOpacity })),
    };
}
