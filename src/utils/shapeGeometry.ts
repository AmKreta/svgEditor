import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { FORMAT_ACTIVE_SHAPE_PAYLOAD } from '../actions/pages/pages.interface';
import { SHAPE_TYPES } from './constant';

export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface MeasuredShape {
    /** Bounding box of the shape on the canvas (after its transform), axis aligned. */
    box: Box;
    /** The transform-origin the shape is rendered with. */
    origin: [number, number];
}

type ShapeEdit = Omit<FORMAT_ACTIVE_SHAPE_PAYLOAD, 'id'>;

const round = (n: number) => Math.round(n * 100) / 100;

export const BOX_DRAWN_SHAPES = [
    SHAPE_TYPES.RECTANGLE,
    SHAPE_TYPES.CIRCLE,
    SHAPE_TYPES.ELLIPSE,
    SHAPE_TYPES.IMAGE,
];

const POINT_SHAPES = [
    SHAPE_TYPES.LINE,
    SHAPE_TYPES.POLYLINE,
    SHAPE_TYPES.POLYGON,
    SHAPE_TYPES.PATH,
];

function parseTransformOrigin(el: Element): [number, number] {
    const [x, y] = (el.getAttribute('transform-origin') || '0 0')
        .trim()
        .split(/[\s,]+/)
        .map(parseFloat);
    return [isNaN(x) ? 0 : x, isNaN(y) ? 0 : y];
}

/** Mirrors the transform built by getStyleObj, including transform-origin. */
function getShapeMatrix(shape: AVAILABLE_SHAPES, [cx, cy]: [number, number]) {
    const { translate, scale, rotate, skewX, skewY } = shape.style;
    return new DOMMatrix()
        .translateSelf(cx + translate[0], cy + translate[1])
        .scaleSelf(scale[0], scale[1])
        .rotateSelf(rotate)
        .skewXSelf(skewX)
        .skewYSelf(skewY)
        .translateSelf(-cx, -cy);
}

export function measureShape(shape: AVAILABLE_SHAPES): MeasuredShape | null {
    const el = document.getElementById(shape.id) as SVGGraphicsElement | null;
    if (!el || typeof el.getBBox !== 'function') {
        return null;
    }
    const local = el.getBBox();
    const origin = parseTransformOrigin(el);
    const matrix = getShapeMatrix(shape, origin);
    const corners = [
        [local.x, local.y],
        [local.x + local.width, local.y],
        [local.x, local.y + local.height],
        [local.x + local.width, local.y + local.height],
    ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix));
    const xs = corners.map(p => p.x);
    const ys = corners.map(p => p.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return {
        box: { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y },
        origin,
    };
}

export function unionBox(boxes: Box[]): Box | null {
    if (!boxes.length) {
        return null;
    }
    const x = Math.min(...boxes.map(b => b.x));
    const y = Math.min(...boxes.map(b => b.y));
    const x2 = Math.max(...boxes.map(b => b.x + b.width));
    const y2 = Math.max(...boxes.map(b => b.y + b.height));
    return { x, y, width: x2 - x, height: y2 - y };
}

function hasOnlyTranslate(shape: AVAILABLE_SHAPES) {
    const { rotate, skewX, skewY, scale } = shape.style;
    return !rotate && !skewX && !skewY && scale[0] === 1 && scale[1] === 1;
}

/**
 * Scales a shape by (sx, sy) around the canvas point (ax, ay).
 * `shape` and `measured` must describe the shape as it was when the gesture began.
 *
 * Untransformed primitives get their geometry edited directly so the property
 * panel stays meaningful and strokes don't stretch. Everything else is scaled
 * through style.scale / style.translate, which is exact for any rotation or skew
 * because scale is the outermost part of the shape's transform.
 */
export function resizeShape(
    shape: AVAILABLE_SHAPES,
    measured: MeasuredShape,
    [ax, ay]: [number, number],
    [sx, sy]: [number, number]
): ShapeEdit {
    const [tx, ty] = shape.style.translate;

    if (hasOnlyTranslate(shape)) {
        const { box } = measured;
        const x = ax + sx * (box.x - ax) - tx;
        const y = ay + sy * (box.y - ay) - ty;
        const width = box.width * sx;
        const height = box.height * sy;

        switch (shape.type) {
            case SHAPE_TYPES.RECTANGLE:
            case SHAPE_TYPES.IMAGE:
                return { properties: { x: round(x), y: round(y), width: round(width), height: round(height) } };
            case SHAPE_TYPES.ELLIPSE:
                return {
                    properties: {
                        x: round(x + width / 2),
                        y: round(y + height / 2),
                        radiusX: round(width / 2),
                        radiusY: round(height / 2),
                    }
                };
            case SHAPE_TYPES.CIRCLE:
                return {
                    properties: {
                        x: round(x + width / 2),
                        y: round(y + height / 2),
                        radius: round(Math.max(width, height) / 2),
                    }
                };
            default:
                if (POINT_SHAPES.includes(shape.type) && 'points' in shape) {
                    const points = shape.points.map(([px, py]) => [
                        round(ax + sx * (px + tx - ax) - tx),
                        round(ay + sy * (py + ty - ay) - ty),
                    ] as [number, number]);
                    return { properties: { points } };
                }
        }
    }

    const [cx, cy] = measured.origin;
    return {
        style: {
            scale: [
                Math.round(shape.style.scale[0] * sx * 1000) / 1000,
                Math.round(shape.style.scale[1] * sy * 1000) / 1000,
            ],
            translate: [
                round(ax + sx * (cx + tx - ax) - cx),
                round(ay + sy * (cy + ty - ay) - cy),
            ],
        }
    };
}

/** Rotates a shape by `degrees` around the canvas point (px, py). */
export function rotateShape(
    shape: AVAILABLE_SHAPES,
    measured: MeasuredShape,
    [px, py]: [number, number],
    degrees: number
): ShapeEdit {
    const [cx, cy] = measured.origin;
    const [tx, ty] = shape.style.translate;
    const rad = degrees * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // where the shape's transform-origin currently sits, rotated around the pivot
    const vx = cx + tx - px;
    const vy = cy + ty - py;
    let rotate = (shape.style.rotate + degrees) % 360;
    if (rotate > 180) rotate -= 360;
    if (rotate <= -180) rotate += 360;
    return {
        style: {
            rotate: round(rotate),
            translate: [
                round(px + vx * cos - vy * sin - cx),
                round(py + vx * sin + vy * cos - cy),
            ],
        }
    };
}

/** Geometry for a box shape dragged out from `start` to `end`. */
export function getDrawnShapeGeometry(
    type: SHAPE_TYPES,
    start: { x: number, y: number },
    end: { x: number, y: number },
    keepRatio: boolean
): ShapeEdit['properties'] {
    let w = end.x - start.x;
    let h = end.y - start.y;
    if (keepRatio || type === SHAPE_TYPES.CIRCLE) {
        const side = Math.max(Math.abs(w), Math.abs(h));
        w = (w < 0 ? -1 : 1) * side;
        h = (h < 0 ? -1 : 1) * side;
    }
    const x = Math.min(start.x, start.x + w);
    const y = Math.min(start.y, start.y + h);
    const width = Math.max(1, Math.abs(w));
    const height = Math.max(1, Math.abs(h));

    switch (type) {
        case SHAPE_TYPES.CIRCLE:
            return { x: round(x + width / 2), y: round(y + height / 2), radius: round(width / 2) };
        case SHAPE_TYPES.ELLIPSE:
            return { x: round(x + width / 2), y: round(y + height / 2), radiusX: round(width / 2), radiusY: round(height / 2) };
        default:
            return { x: round(x), y: round(y), width: round(width), height: round(height) };
    }
}
