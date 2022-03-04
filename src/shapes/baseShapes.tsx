import React from 'react';
import { State } from '../store/store';
import { useSelector, useDispatch } from 'react-redux';
import { getActiveShapesInfo, getCurrentShape } from '../selector/selector';
import { AVAILABLE_SHAPES } from './availableShapes';
import { setActiveShapeCoordinates, toggleContextMenu } from '../actions/pages/pages.actions';
import { SHAPE_TYPES } from '../utils/constant';
import { MEASUREMENT, STYLE } from './style';
import generateId from '../utils/idGenerator';
import { setHoveredShape, setActiveShape } from '../actions/pages/pages.actions';
import { ACTIVE_SHAPE_INFO } from '../actions/pages/pages.interface';
import { GROUP_SHAPE } from './group';
import { PATH_SHAPE } from './path';

export interface BASE_SHAPE {
    type: SHAPE_TYPES,
    name: string | SHAPE_TYPES,
    id: string;
    x: number;
    x_unit: MEASUREMENT;
    y: number;
    y_unit: MEASUREMENT;
    style: STYLE
};

export interface BASE_SHAPE_PROPS {
    isActive: boolean,
    index: number,
    hovered: boolean
};

export interface WRAPPED_SHAPE_PROPS {
    mouseDownHandler: (e: React.MouseEvent<SVGElement>) => void;
    mouseEnterHandler: (e: React.MouseEvent<SVGElement>) => void;
    mouseLeaveHandler: (e: React.MouseEvent<SVGElement>) => void;
    mouseUpHandler: (e: React.MouseEvent<SVGElement>) => void;
    hovered: boolean;
    isActive: boolean;
    index: number;
    shape: AVAILABLE_SHAPES
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
        }
    }
};

const ModifiedShape = (WRAPPED_SHAPE: React.ComponentType<WRAPPED_SHAPE_PROPS>) => {
    return function BaseTool(props: BASE_SHAPE_PROPS) {
        const currentShape = useSelector<State, AVAILABLE_SHAPES>((state: State) => getCurrentShape(state, props.index));
        const activeShapes = useSelector<State, ACTIVE_SHAPE_INFO>(getActiveShapesInfo);
        const dispatch = useDispatch();

        const mouseDownHandler = (e: React.MouseEvent<SVGElement>) => {
            // todo
            // instead of adding previous coordinates to dx and dy , directly assign mouse position
            // this will solve mouse leaving the shaoe sometimes while dragging
            e.preventDefault();
            e.stopPropagation();
            e.cancelable = true;

            if (e.buttons === 2) {
                //right click
                if (currentShape.type === SHAPE_TYPES.GROUP) {
                    let x = 0, y = 0;
                    (currentShape as GROUP_SHAPE).children.forEach(child => { x += child.x; y += child.y; });
                    x /= (currentShape as GROUP_SHAPE).children.length;
                    y /= (currentShape as GROUP_SHAPE).children.length;
                    dispatch(toggleContextMenu({ x, y }))
                }
                else if (currentShape.type === SHAPE_TYPES.PATH) {
                    let x = 0, y = 0;
                    (currentShape as PATH_SHAPE).points.forEach(points => {
                        x += points[0]; y += points[1];
                    });
                    x /= (currentShape as PATH_SHAPE).points.length;
                    y /= (currentShape as PATH_SHAPE).points.length;
                    dispatch(toggleContextMenu({ x, y }));
                }
                else {
                    dispatch(toggleContextMenu({ x: currentShape.x, y: currentShape.y }))
                }
            }

            if (activeShapes.findIndex(shape => shape.id === currentShape.id) === -1) {
                // if element not found in active element list
                // ie element is not currently selected
                dispatch(setActiveShape([{ id: currentShape.id, index: props.index }]));
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
                dispatch(setActiveShapeCoordinates({ x: dx, y: dy }));
            }
            return false;
        }

        const mouseUpHandler = (e: React.MouseEvent<SVGElement>) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.onmousemove = null;
        }

        const mouseEnterHandler = (e: React.MouseEvent<SVGElement>) => {
            dispatch(setHoveredShape(currentShape.id));
        }

        const mouseLeaveHandler = (e: React.MouseEvent<SVGElement>) => {
            e.currentTarget.onmousemove = null;
            dispatch(setHoveredShape(null));
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
                index={props.index}
                children={(currentShape as GROUP_SHAPE).children}
            />
        );
    }
}

export default ModifiedShape;
