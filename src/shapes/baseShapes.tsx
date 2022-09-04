import React, { useCallback } from 'react';
import { State } from '../store/store';
import { useSelector, useDispatch } from 'react-redux';
import { getActiveShapesInfo, getCurrentShape } from '../selector/selector';
import { AVAILABLE_SHAPES } from './availableShapes';
import { translateActiveShape, toggleContextMenu, scaleActiveShape, rotateActiveShape } from '../actions/pages/pages.actions';
import { SHAPE_TYPES, TRANSFORM_CURSOR_MAPPING } from '../utils/constant';
import { MEASUREMENT, STYLE } from './style';
import generateId from '../utils/idGenerator';
import { setHoveredShape, setActiveShape } from '../actions/pages/pages.actions';
import { getBoundingRectMidPoint } from '../utils/utils';
import { isEqual } from 'lodash';

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
    pageId?:string;
};

export interface BASE_SHAPE_PROPS {
    isActive: boolean;
    id: string;
    hovered: boolean;
};

export interface WRAPPED_SHAPE_PROPS {
    mouseDownHandler: (e: React.MouseEvent<SVGElement>) => void;
    mouseEnterHandler: (e: React.MouseEvent<SVGElement>) => void;
    mouseLeaveHandler: (e: React.MouseEvent<SVGElement>) => void;
    mouseUpHandler: (e: React.MouseEvent<SVGElement>) => void;
    hovered: boolean;
    isActive: boolean;
    shape: AVAILABLE_SHAPES;
};

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
        const activeShapes = useSelector<State, string[]>(getActiveShapesInfo, isEqual);
        const dispatch = useDispatch();

        const mouseDownHandler = useCallback((e: React.MouseEvent<SVGElement>) => {
            // todo
            // instead of adding previous coordinates to dx and dy , directly assign mouse position
            // this will solve mouse leaving the shaoe sometimes while dragging
            e.preventDefault();
            e.stopPropagation();
            e.cancelable = true;

            if (e.buttons === 2) {
                //right click
                const svgEditor = document.getElementById('svgEditor')!;
                const editorBBox = svgEditor.getBoundingClientRect();
                const el = document.getElementById(currentShape.id)!;
                const c = getBoundingRectMidPoint(el.getBoundingClientRect());
                dispatch(toggleContextMenu({
                    x: c.x - editorBBox.x,
                    y: c.y - editorBBox.y
                }));
            }

            if (activeShapes.findIndex(shapeId => shapeId === currentShape.id) === -1) {
                // if element not found in active element list
                // ie element is not currently selected
                dispatch(setActiveShape([currentShape.id]));
            }

            let x = e.clientX;
            let y = e.clientY;

            e.currentTarget.onmousemove = (ev) => {
                e.preventDefault();
                e.stopPropagation();
                let x1 = ev.clientX;
                let y1 = ev.clientY;
                let dx = x1 - x;
                let dy = y1 - y;
                x = x1;
                y = y1;

                if (document.body.style.cursor === TRANSFORM_CURSOR_MAPPING.SCALE) {
                    dispatch(scaleActiveShape([dx, dy]));
                }
                else if (document.body.style.cursor === TRANSFORM_CURSOR_MAPPING.ROTATE) {
                    dispatch(rotateActiveShape(dx));
                }
                else {
                    dispatch(translateActiveShape({ x: dx, y: dy }));
                }
            }
            return false;
        }, [activeShapes, currentShape?.id]);

        const mouseUpHandler = useCallback((e: React.MouseEvent<SVGElement>) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.onmousemove = null;
        }, []);

        const mouseEnterHandler = useCallback((e: React.MouseEvent<SVGElement>) => {
            dispatch(setHoveredShape(currentShape.id));
        }, []);

        const mouseLeaveHandler = useCallback((e: React.MouseEvent<SVGElement>) => {
            e.currentTarget.onmousemove = null;
            dispatch(setHoveredShape(null));
        }, []);


        if (!currentShape) {
            return null;
        }

        return (
            <WRAPPED_SHAPE
                shape={currentShape}
                mouseDownHandler={mouseDownHandler}
                mouseEnterHandler={mouseEnterHandler}
                mouseLeaveHandler={mouseLeaveHandler}
                isActive={props.isActive}
                hovered={props.hovered}
                mouseUpHandler={mouseUpHandler}
            />
        );
    }
}

export default ModifiedShape;
