import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { FLAT_STATE } from './timeline.types';

const TOP_LEVEL_KEYS = ['x', 'y', 'width', 'height', 'radius', 'radiusX', 'radiusY', 'rx', 'ry', 'fontSize', 'fontWeight'];
const STYLE_KEYS = ['fill', 'stroke', 'fillOpacity', 'strokeOpacity', 'strokeWidth', 'rotate', 'skewX', 'skewY'];
const STYLE_PAIR_KEYS = ['translate', 'scale'];

const EPSILON = 1e-6;

/** Flattens the properties of a shape that can be animated into `path -> value`. */
export function flattenShape(shape: AVAILABLE_SHAPES): FLAT_STATE {
    const flat: FLAT_STATE = {};
    const s = shape as any;
    TOP_LEVEL_KEYS.forEach(key => {
        if (typeof s[key] === 'number') {
            flat[key] = s[key];
        }
    });
    if (Array.isArray(s.points)) {
        (s.points as Array<[number, number]>).forEach(([px, py], i) => {
            flat[`points.${i}.0`] = px;
            flat[`points.${i}.1`] = py;
        });
    }
    flat['style.opacity'] = typeof s.style.opacity === 'number' ? s.style.opacity : 1;
    STYLE_KEYS.forEach(key => {
        const value = s.style[key];
        if (typeof value === 'number' || typeof value === 'string') {
            flat[`style.${key}`] = value;
        }
    });
    STYLE_PAIR_KEYS.forEach(key => {
        const pair = s.style[key];
        if (Array.isArray(pair)) {
            flat[`style.${key}.0`] = pair[0];
            flat[`style.${key}.1`] = pair[1];
        }
    });
    return flat;
}

/** Returns a copy of `shape` with the flattened values written onto it; `shape` is not modified. */
export function applyFlatState(shape: AVAILABLE_SHAPES, flat: FLAT_STATE): AVAILABLE_SHAPES {
    const s = shape as any;
    const next: any = {
        ...s,
        style: { ...s.style, translate: [...s.style.translate], scale: [...s.style.scale] },
    };
    if (Array.isArray(s.points)) {
        next.points = s.points.map((p: [number, number]) => [...p]);
    }
    Object.keys(flat).forEach(path => {
        const parts = path.split('.');
        let target = next;
        for (let i = 0; i < parts.length - 1; i++) {
            target = target?.[parts[i]];
        }
        if (target) {
            target[parts[parts.length - 1]] = flat[path];
        }
    });
    return next;
}

/** Properties of `to` that differ from `from`. */
export function diffFlatState(from: FLAT_STATE, to: FLAT_STATE): FLAT_STATE {
    const diff: FLAT_STATE = {};
    Object.keys(to).forEach(key => {
        const a = from[key];
        const b = to[key];
        const changed = typeof a === 'number' && typeof b === 'number'
            ? Math.abs(a - b) > EPSILON
            : a !== b;
        if (changed && key in from) {
            diff[key] = typeof b === 'number' ? Math.round(b * 1000) / 1000 : b;
        }
    });
    return diff;
}

const PROPERTY_GROUPS: Array<{ label: string, test: (key: string) => boolean }> = [
    { label: 'Position', test: key => key === 'x' || key === 'y' || key.startsWith('style.translate') },
    { label: 'Size', test: key => ['width', 'height', 'radius', 'radiusX', 'radiusY'].includes(key) },
    { label: 'Scale', test: key => key.startsWith('style.scale') },
    { label: 'Rotation', test: key => key === 'style.rotate' },
    { label: 'Skew', test: key => key === 'style.skewX' || key === 'style.skewY' },
    { label: 'Opacity', test: key => key === 'style.opacity' },
    { label: 'Fill', test: key => key === 'style.fill' },
    { label: 'Stroke', test: key => key === 'style.stroke' || key === 'style.strokeWidth' },
    { label: 'Opacity', test: key => key === 'style.fillOpacity' || key === 'style.strokeOpacity' },
    { label: 'Corners', test: key => key === 'rx' || key === 'ry' },
    { label: 'Points', test: key => key === 'points' || key.startsWith('points.') },
    { label: 'Font', test: key => ['fontSize', 'fontWeight', 'fontStyle', 'fontFamily', 'genericFontFamily'].includes(key) },
    { label: 'Text', test: key => key === 'text' },
    { label: 'Name', test: key => key === 'name' },
];

/** Human readable groups for a set of animated keys, e.g. ['Position', 'Fill']. */
export function describeState(state: FLAT_STATE): Array<{ label: string, keys: string[] }> {
    const groups: Array<{ label: string, keys: string[] }> = [];
    Object.keys(state).forEach(key => {
        const label = PROPERTY_GROUPS.find(group => group.test(key))?.label || key;
        const group = groups.find(g => g.label === label);
        group ? group.keys.push(key) : groups.push({ label, keys: [key] });
    });
    return groups;
}
