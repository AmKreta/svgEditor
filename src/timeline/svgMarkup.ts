import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { GRADIENT } from '../actions/pages/pages.interface';
import { STYLE } from '../shapes/style';
import { SHAPE_TYPES } from '../utils/constant';
import { getCssFilterString } from '../utils/utils';

/*
 * Plain SVG markup for shapes, matching what the editor's shape components render. Used where
 * the editor isn't mounted (landing page previews, page thumbnails of generated documents).
 */

type SHAPES = { [id: string]: AVAILABLE_SHAPES };
type POINT = [number, number];

const escape = (value: unknown) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const attrs = (values: { [key: string]: unknown }) => Object.keys(values)
    .filter(key => values[key] !== undefined && values[key] !== null && values[key] !== '')
    .map(key => `${key}="${escape(values[key])}"`)
    .join(' ');

function styleAttrs(style: STYLE, origin: POINT) {
    const s = style;
    const filter = getCssFilterString(s.cssFilters || {});
    return {
        fill: s.fill,
        'fill-opacity': s.fillOpacity,
        'fill-rule': s.fillRule,
        stroke: s.stroke,
        'stroke-width': `${s.strokeWidth}${s.strokeWidth_unit || 'px'}`,
        'stroke-dasharray': s.strokeDasharray?.join(' '),
        'stroke-linecap': s.strokeLinecap,
        'stroke-linejoin': s.strokeLinejoin,
        'stroke-opacity': s.strokeOpacity,
        opacity: s.opacity ?? 1,
        transform: `translate(${s.translate[0]} ${s.translate[1]}) scale(${s.scale[0]} ${s.scale[1]}) rotate(${s.rotate}) skewX(${s.skewX}) skewY(${s.skewY})`,
        'transform-origin': `${origin[0]} ${origin[1]}`,
        style: filter ? `filter:${filter}` : undefined,
    };
}

function pointsMid(points: POINT[]): POINT {
    if (!points.length) {
        return [0, 0];
    }
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
}

/** Where each shape's transforms pivot, as the editor computes it. */
function originOf(shape: AVAILABLE_SHAPES, all: SHAPES): POINT {
    const s = shape as any;
    switch (shape.type) {
        case SHAPE_TYPES.RECTANGLE:
        case SHAPE_TYPES.IMAGE:
            return [s.x + s.width / 2, s.y + s.height / 2];
        case SHAPE_TYPES.CIRCLE:
        case SHAPE_TYPES.ELLIPSE:
            return [s.x, s.y];
        case SHAPE_TYPES.LINE: {
            const [[x1, y1], [x2, y2]] = s.points;
            return [(x1 + x2) / 2, (y1 + y2) / 2];
        }
        case SHAPE_TYPES.TEXT: {
            const width = String(s.text).length * s.fontSize * 0.55;
            return [s.x + width / 2, s.y - s.fontSize * 0.35];
        }
        case SHAPE_TYPES.GROUP:
            return pointsMid((s.children as string[]).filter(id => all[id]).map(id => originOf(all[id], all)));
        default:
            return pointsMid(s.points || []);
    }
}

export function shapeMarkup(shape: AVAILABLE_SHAPES, all: SHAPES): string {
    const s = shape as any;
    const common = styleAttrs(shape.style, originOf(shape, all));
    switch (shape.type) {
        case SHAPE_TYPES.RECTANGLE:
            return `<rect ${attrs({ x: s.x, y: s.y, width: s.width, height: s.height, rx: s.rx, ry: s.ry, ...common })}/>`;
        case SHAPE_TYPES.IMAGE:
            return `<image ${attrs({ x: s.x, y: s.y, width: s.width, height: s.height, href: s.base64Url, ...common })}/>`;
        case SHAPE_TYPES.CIRCLE:
            return `<circle ${attrs({ cx: s.x, cy: s.y, r: s.radius, ...common })}/>`;
        case SHAPE_TYPES.ELLIPSE:
            return `<ellipse ${attrs({ cx: s.x, cy: s.y, rx: s.radiusX, ry: s.radiusY, ...common })}/>`;
        case SHAPE_TYPES.LINE: {
            const [[x1, y1], [x2, y2]] = s.points;
            return `<line ${attrs({ x1, y1, x2, y2, ...common })}/>`;
        }
        case SHAPE_TYPES.POLYGON:
            return `<polygon ${attrs({ points: s.points.toString(), ...common })}/>`;
        case SHAPE_TYPES.POLYLINE:
            return `<polyline ${attrs({ points: s.points.toString(), ...common })}/>`;
        case SHAPE_TYPES.PATH: {
            const [first, ...rest] = s.points as POINT[];
            return first ? `<path ${attrs({ d: `M ${first[0]} ${first[1]} C ${rest.toString()}`, ...common })}/>` : '';
        }
        case SHAPE_TYPES.TEXT:
            return `<text ${attrs({
                x: s.x,
                y: s.y,
                'font-size': s.fontSize,
                'font-weight': s.fontWeight,
                'font-style': s.fontStyle,
                'font-family': `${s.fontFamily}, ${s.genericFontFamily}`,
                ...common,
            })}>${escape(s.text)}</text>`;
        case SHAPE_TYPES.GROUP:
            return `<g ${attrs(common)}>${(s.children as string[]).filter(id => all[id]).map(id => shapeMarkup(all[id], all)).join('')}</g>`;
        default:
            return '';
    }
}

/** Markup for every top-level shape, in drawing order. */
export function shapesToMarkup(shapes: SHAPES): string {
    return Object.keys(shapes)
        .filter(id => shapes[id].render)
        .map(id => shapeMarkup(shapes[id], shapes))
        .join('');
}

/** `<defs>` for the document's palette gradients, as the editor renders them. */
export function gradientDefs(gradients: { [id: string]: GRADIENT }): string {
    const defs = Object.keys(gradients).map(id => {
        const g = gradients[id];
        const stops = g.stops.map(stop =>
            `<stop offset="${stop.offset}%" style="stop-color:${escape(stop.stopColor)};stop-opacity:${stop.stopOpacity}"/>`
        ).join('');
        const transform = `rotate(${g.rotate || 0}) skewX(${g.skewX || 0}) skewY(${g.skewY || 0})`;
        return g.type === 'linear'
            ? `<linearGradient ${attrs({ id, spreadMethod: g.spreadMethod, gradientTransform: transform })}>${stops}</linearGradient>`
            : `<radialGradient ${attrs({ id, spreadMethod: g.spreadMethod, cx: `${g.cx ?? 50}%`, cy: `${g.cy ?? 50}%`, fx: `${g.fx ?? 50}%`, fy: `${g.fy ?? 50}%`, fr: `${g.fr ?? 0}%` })}>${stops}</radialGradient>`;
    }).join('');
    return defs ? `<defs>${defs}</defs>` : '';
}
