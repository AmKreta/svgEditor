import React, { useState, useLayoutEffect, useRef } from 'react';
import BaseTool, { BASE_SHAPE, getBaseToolDefaultProps, WRAPPED_SHAPE_PROPS } from "./baseShapes";
import { getBoundingRectMidPoint, getStyleObj,getTransformOrigin } from "../utils/utils";
import { SHAPE_TYPES } from "../utils/constant";

interface POLYLINE {
    points: Array<[number, number]>
};

export interface POLYLINE_SHAPE extends BASE_SHAPE, POLYLINE { };

export const getPolylineDefaultProps: (points: Array<[number, number]>) => POLYLINE_SHAPE = (points: Array<[number, number]>) => {
    const defaultPolylineProps: POLYLINE_SHAPE = {
        ...getBaseToolDefaultProps({ x: 0, y: 0, type: SHAPE_TYPES.POLYLINE }),
        points
    };
    return defaultPolylineProps;
}

const Polyline: React.FC<WRAPPED_SHAPE_PROPS> = function (props) {
    const shape = props.shape as POLYLINE_SHAPE;
    const [midPoint, setMidPoint] = useState({ x: 0, y: 0 });
    const ref = useRef<SVGPolylineElement>(null);

    useLayoutEffect(function () {
        setMidPoint(getBoundingRectMidPoint(ref.current?.getBBox()));
    }, [shape.points]);

    return (
        <polyline
            id={shape.id}
            onMouseDown={props.mouseDownHandler}
            onMouseUp={props.mouseUpHandler}
            onMouseEnter={props.mouseEnterHandler}
            onMouseLeave={props.mouseLeaveHandler}
            className={props.hovered || props.isActive ? 'active' : 'inactive'}
            {...getStyleObj(shape.style)}
            points={shape.points.toString()}
            transform-origin={`${midPoint.x} ${midPoint.y}`}
            ref={ref}
        />
    );
}
export default BaseTool(Polyline);