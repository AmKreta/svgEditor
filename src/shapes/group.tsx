import React, { useRef, useState, useLayoutEffect } from 'react';
import { AVAILABLE_SHAPES } from "./availableShapes";
import BaseShape, { BASE_SHAPE, getBaseToolDefaultProps, WRAPPED_SHAPE_PROPS } from "./baseShapes";
import { SHAPE_TYPES } from "../utils/constant";
import { getBoundingRectMidPoint, getStyleObj, getTransformOrigin } from "../utils/utils";
import { CIRCLE_SHAPE } from "./circle";
import { RECTANGLE_SHAPE } from "./rectangle";
import { POLYGON_SHAPE } from "./polygon";
import { POLYLINE_SHAPE } from "./polyline";
import { IMAGE_SHAPE } from "./image";
import { LINE_SHAPE } from "./line";
import { ELLIPSE_SHAPE } from "./ellipse";
import { TEXT_SHAPE } from "./text";
import Path, { PATH_SHAPE } from './path';
import { useSelector } from 'react-redux';
import { getShapesOfCurrentPage } from '../selector/selector';
import { State } from '../store/store';

export interface GROUP_SHAPE extends BASE_SHAPE {
    children: string[];
};

export const getGroupDefaultProps: (children: string[]) => GROUP_SHAPE = (children: string[]) => {
    const defaultGroupProps: GROUP_SHAPE = {
        ...getBaseToolDefaultProps({ x: 0, y: 0, type: SHAPE_TYPES.GROUP }),
        children
    }
    return defaultGroupProps;
};


const Group: React.FC<WRAPPED_SHAPE_PROPS> = function (props) {
    const shape = props.shape as GROUP_SHAPE;
    const ref = useRef<any>(null);
    const [groupMidPoint, setGroupMidPoint] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const groupChildren = useSelector((state: State) => {
        const groundChildren = shape.children.map(childId => state.page.pages[state.page.activePageIndex].shapes[childId]);
        return groundChildren;
    });

    useLayoutEffect(function () {
        const timeout = setTimeout(function () {
            setGroupMidPoint(getBoundingRectMidPoint(ref.current?.getBBox()));
            clearTimeout(timeout);
        })
    }, []);

    return (
        <g
            id={shape.id}
            onMouseDown={props.mouseDownHandler}
            onMouseUp={props.mouseUpHandler}
            onMouseEnter={props.mouseEnterHandler}
            onMouseLeave={props.mouseLeaveHandler}
            className={props.hovered || props.isActive ? 'active' : 'inactive'}
            {...getStyleObj(shape.style)}
            ref={ref}
            transform-origin={`${groupMidPoint.x} ${groupMidPoint.y}`}
        >
            {
                groupChildren?.map(childShape => {
                    switch (childShape.type) {

                        case SHAPE_TYPES.CIRCLE: {
                            const shape = childShape as CIRCLE_SHAPE;
                            return (
                                <circle
                                    cx={shape.x}
                                    cy={shape.y}
                                    r={shape.radius}
                                    {...getStyleObj(shape.style)}
                                    transform-origin={`${shape.x} ${shape.y}`}
                                    key={shape.id}
                                />
                            );
                        }

                        case SHAPE_TYPES.RECTANGLE: {
                            const shape = childShape as RECTANGLE_SHAPE;
                            return (
                                <rect
                                    x={shape.x}
                                    y={shape.y}
                                    height={shape.height}
                                    width={shape.width}
                                    {...getStyleObj(shape.style)}
                                    transform-origin={`${shape.x + shape.width / 2} ${shape.y + shape.height / 2}`}
                                    rx={shape.rx}
                                    ry={shape.ry}
                                    key={shape.id}
                                />
                            );
                        }

                        case SHAPE_TYPES.POLYGON: {
                            const shape = childShape as POLYGON_SHAPE;
                            const transformOrigin = getBoundingRectMidPoint(ref.current?.getBBox());
                            return (
                                <polygon
                                    id={shape.id}
                                    {...getStyleObj(shape.style)}
                                    points={shape.points.toString()}
                                    transform-origin={`${transformOrigin.x} ${transformOrigin.y}`}
                                    key={shape.id}
                                    ref={ref}
                                />
                            );
                        }

                        case SHAPE_TYPES.POLYLINE: {
                            const shape = childShape as POLYLINE_SHAPE;
                            const transformOrigin = getBoundingRectMidPoint(ref.current?.getBBox());
                            return (
                                <polyline
                                    id={shape.id}
                                    {...getStyleObj(shape.style)}
                                    points={shape.points.toString()}
                                    transform-origin={`${transformOrigin.x} ${transformOrigin.y}`}
                                    key={shape.id}
                                    ref={ref}
                                />
                            );
                        }

                        case SHAPE_TYPES.IMAGE: {
                            const shape = childShape as IMAGE_SHAPE;
                            return (
                                <image
                                    x={shape.x}
                                    y={shape.y}
                                    height={shape.height}
                                    width={shape.width}
                                    {...getStyleObj(shape.style)}
                                    transform-origin={`${shape.x + shape.width / 2} ${shape.y + shape.height / 2}`}
                                    href={shape.base64Url}
                                    key={shape.id}
                                />
                            );
                        }

                        case SHAPE_TYPES.LINE: {
                            const shape = childShape as LINE_SHAPE;
                            const [[x1, y1], [x2, y2]] = shape.points;
                            const transformOrigin = getTransformOrigin(shape.points);
                            return (
                                <line
                                    {...getStyleObj(shape.style)}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    transform-origin={transformOrigin}
                                    key={shape.id}
                                />
                            );
                        }

                        case SHAPE_TYPES.ELLIPSE: {
                            const shape = childShape as ELLIPSE_SHAPE;
                            return (
                                <ellipse
                                    cx={shape.x}
                                    cy={shape.y}
                                    rx={shape.radiusX}
                                    ry={shape.radiusY}
                                    {...getStyleObj(shape.style)}
                                    transform-origin={`${shape.x} ${shape.y}`}
                                    key={shape.id}
                                />
                            );
                        }

                        case SHAPE_TYPES.TEXT: {
                            const shape = childShape as TEXT_SHAPE;
                            const textMidPoint = getBoundingRectMidPoint(ref.current?.getBBox());
                            return (
                                <text
                                    x={shape.x}
                                    y={shape.y}
                                    {...getStyleObj(shape.style)}
                                    transform-origin={`${textMidPoint.x} ${textMidPoint.y}`}
                                    fontSize={shape.fontSize}
                                    fontWeight={shape.fontWeight}
                                    fontStyle={shape.fontStyle}
                                    font-family={`${shape.fontFamily}, ${shape.genericFontFamily}`}
                                    ref={ref}
                                    key={shape.id}
                                >
                                    {shape.text}
                                </text>
                            );
                        }

                        case SHAPE_TYPES.PATH: {
                            const shape = childShape as PATH_SHAPE;
                            const transformOrigin = getBoundingRectMidPoint(ref.current?.getBBox());
                            return (
                                <path
                                    id={shape.id}
                                    {...getStyleObj(shape.style)}
                                    d={(function () {
                                        let [p1, ...p] = shape.points || [[0, 0], [0, 0]];
                                        if (p1 && p) {
                                            return `M ${p1[0]} ${p1[1]} C ${p.toString()} Z`;
                                        }
                                        return '';
                                    })()}
                                    transform-origin={`${transformOrigin.x} ${transformOrigin.y}`}
                                    ref={ref}
                                    key={shape.id}
                                />
                            );
                        }

                        case SHAPE_TYPES.GROUP: {
                            return (
                                <Group
                                    shape={childShape}
                                    mouseDownHandler={props.mouseDownHandler}
                                    mouseUpHandler={props.mouseUpHandler}
                                    mouseEnterHandler={props.mouseEnterHandler}
                                    mouseLeaveHandler={props.mouseLeaveHandler}
                                    isActive={props.isActive}
                                    hovered={props.hovered}
                                    children={(childShape as GROUP_SHAPE).children}
                                    key={shape.id}
                                />
                            );
                        }

                        default: return null;
                    }
                })
            }
        </g>
    );
}


export default BaseShape(Group);