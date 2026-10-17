import React, { useCallback, useEffect, useRef } from 'react';
import { State } from '../store/store';
import { useSelector, useDispatch } from 'react-redux';
import { getActiveShapesInfo, getActiveTool, getCurrentShape, getDisplayedShape } from '../selector/selector';
import { AVAILABLE_SHAPES } from './availableShapes';
import { translateActiveShape, toggleContextMenu, scaleActiveShape, rotateActiveShape } from '../actions/pages/pages.actions';
import {
    POINTER_BUTTON,
    ROTATE_DEGREES_PER_PIXEL,
    SCALE_PER_PIXEL,
    SHAPE_TYPES,
    TRANSFORM_MODE
} from '../utils/constant';
import { MEASUREMENT, STYLE } from './style';
import generateId from '../utils/idGenerator';
import { setHoveredShape, setActiveShape } from '../actions/pages/pages.actions';
import { getBoundingRectMidPoint } from '../utils/utils';
import { isEqual } from 'lodash';
import { useRAFThrottled } from '../hooks/useRAFThrottled';
import { getActiveTransformMode } from '../utils/transformMode';
import { CURSORS, setGlobalCursor } from '../utils/cursor';

const DRAG_CURSOR_BY_MODE: Record<TRANSFORM_MODE, string> = {
    [TRANSFORM_MODE.TRANSLATE]: CURSORS.DRAGGING,
    [TRANSFORM_MODE.SCALE]: CURSORS.SCALE,
    [TRANSFORM_MODE.ROTATE]: CURSORS.ROTATE,
};

export interface BASE_SHAPE {
    type: SHAPE_TYPES,
    name: string | SHAPE_TYPES,
    id: string;
    x: number;
    x_unit: MEASUREMENT;
    y: number;
    y_unit: MEASUREMENT;
    style: STYLE;
    render: boolean;
    pageId?: string;
};

export interface BASE_SHAPE_PROPS {
    isActive: boolean;
    id: string;
    hovered: boolean;
};

export type ShapePointerEvent = React.PointerEvent<SVGElement>;

export interface WRAPPED_SHAPE_PROPS {
    mouseDownHandler: (e: ShapePointerEvent) => void;
    mouseEnterHandler: (e: ShapePointerEvent) => void;
    mouseLeaveHandler: (e: ShapePointerEvent) => void;
    hovered: boolean;
    isActive: boolean;
    shape: AVAILABLE_SHAPES;
};

export function shapePointerProps(props: WRAPPED_SHAPE_PROPS) {
    return {
        onPointerDown: props.mouseDownHandler,
        onPointerEnter: props.mouseEnterHandler,
        onPointerLeave: props.mouseLeaveHandler,
    };
}

export function getBaseToolDefaultProps({ type, x, y }: { type: SHAPE_TYPES, x: number, y: number }): BASE_SHAPE {
    return {
        id: generateId(),
        name: type,
        type,
        x,
        y,
        x_unit: 'px',
        y_unit: 'px',
        style: {
            fill: 'transparent',
            fillRule: 'nonzero',
            stroke: 'black',
            strokeWidth: 1,
            strokeWidth_unit: 'px',
            strokeDasharray: [],
            strokeDashoffset: 0,
            strokeLinecap: 'square',
            strokeOpacity: 1,
            strokeLinejoin: 'miter',
            strokeMitterlimit: 4,
            fillOpacity: 1,
            rotate: 0,
            translate: [0, 0],
            skewX: 0,
            skewY: 0,
            scale: [1, 1],
            cssFilters: {},
            svgFilters: {}
        },
        render: true
    }
};

const ModifiedShape = (WRAPPED_SHAPE: React.ComponentType<WRAPPED_SHAPE_PROPS>) => {
    return function BaseTool(props: BASE_SHAPE_PROPS) {
        const currentShape = useSelector<State, AVAILABLE_SHAPES>((state: State) => getCurrentShape(state, props.id));
        // the animated version while the timeline is previewing, otherwise the shape itself
        const displayedShape = useSelector<State, AVAILABLE_SHAPES>((state: State) => getDisplayedShape(state, props.id));
        const activeShapes = useSelector<State, string[]>(getActiveShapesInfo, isEqual);
        const activeTool = useSelector<State, SHAPE_TYPES>(getActiveTool);
        const dispatch = useDispatch();
        const draggingRef = useRef(false);
        const lastClientRef = useRef({ x: 0, y: 0 });
        const modeRef = useRef<TRANSFORM_MODE>(TRANSFORM_MODE.TRANSLATE);
        const pendingTranslate = useRef({ x: 0, y: 0 });
        const pendingScale = useRef({ x: 0, y: 0 });
        const pendingRotate = useRef(0);

        const flushGesture = useRAFThrottled(() => {
            const { x, y } = pendingTranslate.current;
            if (x || y) {
                dispatch(translateActiveShape({ x, y }));
                pendingTranslate.current = { x: 0, y: 0 };
            }
            const sx = pendingScale.current.x;
            const sy = pendingScale.current.y;
            if (sx || sy) {
                dispatch(scaleActiveShape([sx, sy]));
                pendingScale.current = { x: 0, y: 0 };
            }
            if (pendingRotate.current) {
                dispatch(rotateActiveShape(pendingRotate.current));
                pendingRotate.current = 0;
            }
        });

        const stopListeningRef = useRef<(() => void) | null>(null);

        const dragMove = useCallback((e: PointerEvent) => {
            if (!draggingRef.current) {
                return;
            }
            const dx = e.clientX - lastClientRef.current.x;
            const dy = e.clientY - lastClientRef.current.y;
            lastClientRef.current = { x: e.clientX, y: e.clientY };

            if (modeRef.current === TRANSFORM_MODE.SCALE) {
                pendingScale.current.x += dx * SCALE_PER_PIXEL;
                pendingScale.current.y += dy * SCALE_PER_PIXEL;
            } else if (modeRef.current === TRANSFORM_MODE.ROTATE) {
                pendingRotate.current += dx * ROTATE_DEGREES_PER_PIXEL;
            } else {
                pendingTranslate.current.x += dx;
                pendingTranslate.current.y += dy;
            }
            flushGesture();
        }, [flushGesture]);

        const endDrag = useCallback(() => {
            stopListeningRef.current?.();
            stopListeningRef.current = null;
            if (!draggingRef.current) {
                return;
            }
            draggingRef.current = false;
            flushGesture.flush();
            setGlobalCursor(null);
        }, [flushGesture]);

        // don't leave window listeners or a forced cursor behind if the shape is removed mid-drag
        useEffect(() => endDrag, [endDrag]);

        const mouseDownHandler = useCallback((e: ShapePointerEvent) => {
            if (e.button === POINTER_BUTTON.PRIMARY && activeTool !== SHAPE_TYPES.PAN) {
                // a drawing tool is active: let the press reach the canvas so it starts a new shape
                return;
            }
            e.preventDefault();
            e.stopPropagation();

            if (e.button === POINTER_BUTTON.SECONDARY) {
                const svgEditor = document.getElementById('svgEditor')!;
                const editorBBox = svgEditor.getBoundingClientRect();
                const el = document.getElementById(currentShape.id)!;
                const c = getBoundingRectMidPoint(el.getBoundingClientRect());
                dispatch(toggleContextMenu({
                    x: c.x - editorBBox.x,
                    y: c.y - editorBBox.y
                }));
                return;
            }

            if (e.button !== POINTER_BUTTON.PRIMARY) {
                return;
            }

            if (activeShapes.findIndex(shapeId => shapeId === currentShape.id) === -1) {
                dispatch(setActiveShape([currentShape.id]));
            }

            draggingRef.current = true;
            modeRef.current = getActiveTransformMode();
            lastClientRef.current = { x: e.clientX, y: e.clientY };
            pendingTranslate.current = { x: 0, y: 0 };
            pendingScale.current = { x: 0, y: 0 };
            pendingRotate.current = 0;
            setGlobalCursor(DRAG_CURSOR_BY_MODE[modeRef.current]);

            // Selecting a shape re-orders it in the DOM, which drops pointer capture,
            // so the drag is tracked on window rather than on the element.
            stopListeningRef.current?.();
            window.addEventListener('pointermove', dragMove);
            window.addEventListener('pointerup', endDrag);
            window.addEventListener('pointercancel', endDrag);
            stopListeningRef.current = () => {
                window.removeEventListener('pointermove', dragMove);
                window.removeEventListener('pointerup', endDrag);
                window.removeEventListener('pointercancel', endDrag);
            };
        }, [activeShapes, activeTool, currentShape?.id, dispatch, dragMove, endDrag]);

        const mouseEnterHandler = useCallback((e: ShapePointerEvent) => {
            if (draggingRef.current) {
                return;
            }
            dispatch(setHoveredShape(currentShape.id));
        }, [currentShape?.id, dispatch]);

        const mouseLeaveHandler = useCallback((e: ShapePointerEvent) => {
            if (draggingRef.current) {
                return;
            }
            dispatch(setHoveredShape(null));
        }, [dispatch]);

        if (!currentShape) {
            return null;
        }

        return (
            <WRAPPED_SHAPE
                shape={displayedShape}
                mouseDownHandler={mouseDownHandler}
                mouseEnterHandler={mouseEnterHandler}
                mouseLeaveHandler={mouseLeaveHandler}
                isActive={props.isActive}
                hovered={props.hovered}
            />
        );
    }
}

export default ModifiedShape;
