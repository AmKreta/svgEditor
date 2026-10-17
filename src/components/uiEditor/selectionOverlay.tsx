import React, { useCallback, useLayoutEffect, useState } from 'react';
import styled from 'styled-components';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { cloneDeep, isEqual } from 'lodash';
import { getActiveShapes, getSvgStyle } from '../../selector/selector';
import { State } from '../../store/store';
import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import { formatActiveShape } from '../../actions/pages/pages.actions';
import { SHAPE_TYPES } from '../../utils/constant';
import { eventToSvgPoint } from '../../utils/svgCoords';
import { createRAFThrottled } from '../../utils/rafThrottle';
import { ROTATE_CURSOR, setGlobalCursor } from '../../utils/cursor';
import { Box, measureShape, MeasuredShape, resizeShape, rotateShape, unionBox } from '../../utils/shapeGeometry';

interface Handle {
    id: string;
    /** -1 = left/top edge, 1 = right/bottom edge, 0 = middle */
    hx: -1 | 0 | 1;
    hy: -1 | 0 | 1;
    cursor: string;
}

const HANDLES: Handle[] = [
    { id: 'nw', hx: -1, hy: -1, cursor: 'nwse-resize' },
    { id: 'n', hx: 0, hy: -1, cursor: 'ns-resize' },
    { id: 'ne', hx: 1, hy: -1, cursor: 'nesw-resize' },
    { id: 'e', hx: 1, hy: 0, cursor: 'ew-resize' },
    { id: 'se', hx: 1, hy: 1, cursor: 'nwse-resize' },
    { id: 's', hx: 0, hy: 1, cursor: 'ns-resize' },
    { id: 'sw', hx: -1, hy: 1, cursor: 'nesw-resize' },
    { id: 'w', hx: -1, hy: 0, cursor: 'ew-resize' },
];

const HANDLE_SIZE = 8;
const ROTATE_HANDLE_OFFSET = 24;
/** Below this size, edge handles crowd the corners, so only corners are shown. */
const MIN_SIZE_FOR_EDGE_HANDLES = 32;
const MIN_RESIZE = 1;
const ROTATE_SNAP_DEGREES = 15;
const ACCENT = '#3b82f6';

interface Props {
    svgEditorRef: React.RefObject<SVGSVGElement>;
    hidden?: boolean;
}

interface GestureItem {
    shape: AVAILABLE_SHAPES;
    measured: MeasuredShape;
}

const SelectionOverlay: React.FC<Props> = function ({ svgEditorRef, hidden = false }) {
    const shapes = useSelector<State, AVAILABLE_SHAPES[]>(
        state => getActiveShapes(state).filter(shape => shape?.render),
        shallowEqual
    );
    const svgStyle = useSelector(getSvgStyle);
    const dispatch = useDispatch();
    const [box, setBox] = useState<Box | null>(null);
    const [gesture, setGesture] = useState<'resize' | 'rotate' | null>(null);

    const measure = useCallback(() => {
        const boxes = shapes
            .map(measureShape)
            .filter((m): m is MeasuredShape => Boolean(m))
            .map(m => m.box);
        const next = unionBox(boxes);
        setBox(prev => isEqual(prev, next) ? prev : next);
    }, [shapes]);

    useLayoutEffect(() => {
        measure();
        // some shapes (text, groups) settle their transform-origin a frame later
        const frame = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(frame);
    }, [measure, svgStyle]);

    function startGesture(
        e: React.PointerEvent<SVGElement>,
        kind: 'resize' | 'rotate',
        onMove: (items: GestureItem[], start: Box, from: DOMPoint, to: { x: number, y: number }, shiftKey: boolean) => void,
        cursor: string
    ) {
        if (e.button !== 0) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();

        const svg = svgEditorRef.current;
        const items = shapes
            .map(shape => ({ shape: cloneDeep(shape), measured: measureShape(shape) }))
            .filter((item): item is GestureItem => Boolean(item.measured));
        const start = unionBox(items.map(item => item.measured.box));
        if (!svg || !start) {
            return;
        }
        const p0 = eventToSvgPoint(svg, e);
        const from = new DOMPoint(p0.x, p0.y);

        const update = createRAFThrottled((ev: PointerEvent) => {
            onMove(items, start, from, eventToSvgPoint(svg, ev), ev.shiftKey);
        });
        const end = () => {
            update.flush();
            window.removeEventListener('pointermove', update);
            window.removeEventListener('pointerup', end);
            window.removeEventListener('pointercancel', end);
            setGlobalCursor(null);
            setGesture(null);
        };

        window.addEventListener('pointermove', update);
        window.addEventListener('pointerup', end);
        window.addEventListener('pointercancel', end);
        setGlobalCursor(cursor);
        setGesture(kind);
    }

    const startResize = (handle: Handle) => (e: React.PointerEvent<SVGElement>) => {
        startGesture(e, 'resize', (items, start, from, to, shiftKey) => {
            const { hx, hy } = handle;
            const x0 = start.x, x1 = start.x + start.width;
            const y0 = start.y, y1 = start.y + start.height;
            const dx = to.x - from.x;
            const dy = to.y - from.y;

            let width = start.width;
            let height = start.height;
            if (hx === 1) width = Math.max(MIN_RESIZE, start.width + dx);
            if (hx === -1) width = Math.max(MIN_RESIZE, start.width - dx);
            if (hy === 1) height = Math.max(MIN_RESIZE, start.height + dy);
            if (hy === -1) height = Math.max(MIN_RESIZE, start.height - dy);

            let sx = start.width > 0 ? width / start.width : 1;
            let sy = start.height > 0 ? height / start.height : 1;
            // the opposite edge stays put
            let ax = hx === -1 ? x1 : x0;
            let ay = hy === -1 ? y1 : y0;

            const keepRatio = shiftKey || items.some(item => item.shape.type === SHAPE_TYPES.CIRCLE);
            if (keepRatio) {
                if (hx && hy) {
                    sx = sy = Math.max(sx, sy);
                } else if (hx) {
                    sy = sx;
                    ay = (y0 + y1) / 2;
                } else {
                    sx = sy;
                    ax = (x0 + x1) / 2;
                }
            }

            items.forEach(({ shape, measured }) => {
                dispatch(formatActiveShape({ id: shape.id, ...resizeShape(shape, measured, [ax, ay], [sx, sy]) }));
            });
        }, handle.cursor);
    };

    const startRotate = (e: React.PointerEvent<SVGElement>) => {
        startGesture(e, 'rotate', (items, start, from, to, shiftKey) => {
            const cx = start.x + start.width / 2;
            const cy = start.y + start.height / 2;
            const angle = (Math.atan2(to.y - cy, to.x - cx) - Math.atan2(from.y - cy, from.x - cx)) * 180 / Math.PI;
            let degrees = angle;
            if (shiftKey) {
                // single shape: snap its absolute angle, otherwise snap the delta
                const base = items.length === 1 ? items[0].shape.style.rotate : 0;
                degrees = Math.round((base + angle) / ROTATE_SNAP_DEGREES) * ROTATE_SNAP_DEGREES - base;
            }
            items.forEach(({ shape, measured }) => {
                dispatch(formatActiveShape({ id: shape.id, ...rotateShape(shape, measured, [cx, cy], degrees) }));
            });
        }, ROTATE_CURSOR);
    };

    const show = !hidden && box && shapes.length > 0;
    const showEdgeHandles = box && box.width >= MIN_SIZE_FOR_EDGE_HANDLES && box.height >= MIN_SIZE_FOR_EDGE_HANDLES;
    // keep the rotate handle on screen when the selection touches the top of the canvas
    const rotateBelow = box ? box.y < ROTATE_HANDLE_OFFSET + HANDLE_SIZE : false;

    return (
        <OverlaySvg height={`${svgStyle.height}%`} width={`${svgStyle.width}%`}>
            {
                show && box
                    ? (
                        <g>
                            <rect
                                x={box.x}
                                y={box.y}
                                width={box.width}
                                height={box.height}
                                fill='none'
                                stroke={ACCENT}
                                strokeWidth={1}
                                shapeRendering='crispEdges'
                            />
                            {
                                gesture !== 'rotate'
                                    ? (
                                        <>
                                            <line
                                                x1={box.x + box.width / 2}
                                                y1={rotateBelow ? box.y + box.height : box.y}
                                                x2={box.x + box.width / 2}
                                                y2={rotateBelow ? box.y + box.height + ROTATE_HANDLE_OFFSET : box.y - ROTATE_HANDLE_OFFSET}
                                                stroke={ACCENT}
                                                strokeWidth={1}
                                            />
                                            <circle
                                                className='handle'
                                                cx={box.x + box.width / 2}
                                                cy={rotateBelow ? box.y + box.height + ROTATE_HANDLE_OFFSET : box.y - ROTATE_HANDLE_OFFSET}
                                                r={HANDLE_SIZE / 2 + 1}
                                                style={{ cursor: ROTATE_CURSOR }}
                                                onPointerDown={startRotate}
                                            >
                                                <title>Rotate (Shift to snap)</title>
                                            </circle>
                                            {
                                                HANDLES
                                                    .filter(handle => showEdgeHandles || (handle.hx && handle.hy))
                                                    .map(handle => (
                                                        <rect
                                                            key={handle.id}
                                                            className='handle'
                                                            x={box.x + (handle.hx + 1) / 2 * box.width - HANDLE_SIZE / 2}
                                                            y={box.y + (handle.hy + 1) / 2 * box.height - HANDLE_SIZE / 2}
                                                            width={HANDLE_SIZE}
                                                            height={HANDLE_SIZE}
                                                            rx={1.5}
                                                            style={{ cursor: handle.cursor }}
                                                            onPointerDown={startResize(handle)}
                                                        />
                                                    ))
                                            }
                                        </>
                                    )
                                    : null
                            }
                        </g>
                    )
                    : null
            }
        </OverlaySvg>
    );
}

const OverlaySvg = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    overflow: visible;
    pointer-events: none;

    & .handle{
        fill: white;
        stroke: ${ACCENT};
        stroke-width: 1.5;
        pointer-events: all;
        &:hover{
            fill: ${ACCENT};
        }
    }
`;

export default SelectionOverlay;
