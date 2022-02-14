import React, { useRef } from 'react';
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

export interface GROUP_SHAPE extends BASE_SHAPE {
    children: AVAILABLE_SHAPES[];
};

export const getGroupDefaultProps: (children: Array<AVAILABLE_SHAPES>) => GROUP_SHAPE = (children: Array<AVAILABLE_SHAPES>) => {
    const defaultGroupProps: GROUP_SHAPE = {
        ...getBaseToolDefaultProps({ x: 0, y: 0, type: SHAPE_TYPES.GROUP }),
        children
    }
    return defaultGroupProps;
};


const Group: React.FC<WRAPPED_SHAPE_PROPS> = function (props) {
    const shape = props.shape as GROUP_SHAPE;
    const groupRef = useRef<SVGGElement>(null);
    const textRef = useRef<SVGTextElement>(null);
    const groupMidPoint = getBoundingRectMidPoint(groupRef.current?.getBBox());
    return (
        <g
            id={shape.id}
            data-index={props.index}
            onMouseDown={props.mouseDownHandler}
            onMouseUp={props.mouseUpHandler}
            onMouseEnter={props.mouseEnterHandler}
            onMouseLeave={props.mouseLeaveHandler}
            className={props.hovered || props.isActive ? 'active' : 'inactive'}
            {...getStyleObj(shape.style)}
            ref={groupRef}
            transform-origin={`${groupMidPoint.x} ${groupMidPoint.y}`}
        >
            {
                shape.children?.map(childShape => {
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
                                />
                            );
                        }

                        case SHAPE_TYPES.POLYGON: {
                            const shape = childShape as POLYGON_SHAPE;
                            const transformOrigin = getTransformOrigin(shape.points);
                            return (
                                <polygon
                                    id={shape.id}
                                    {...getStyleObj(shape.style)}
                                    points={shape.points.toString()}
                                    transform-origin={transformOrigin}
                                />
                            );
                        }

                        case SHAPE_TYPES.POLYLINE: {
                            const shape = childShape as POLYLINE_SHAPE;
                            const transformOrigin = getTransformOrigin(shape.points);
                            return (
                                <polyline
                                    id={shape.id}
                                    {...getStyleObj(shape.style)}
                                    points={shape.points.toString()}
                                    transform-origin={transformOrigin}
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
                                />
                            );
                        }

                        case SHAPE_TYPES.TEXT: {
                            const shape = childShape as TEXT_SHAPE;
                            const textMidPoint = getBoundingRectMidPoint(textRef.current?.getBBox());
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
                                    ref={textRef}
                                >
                                    {shape.text}
                                </text>
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