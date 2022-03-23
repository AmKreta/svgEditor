import React from "react";
import BaseTool, { BASE_SHAPE, WRAPPED_SHAPE_PROPS, getBaseToolDefaultProps } from "./baseShapes";
import { MEASUREMENT } from './style';
import { getStyleObj } from "../utils/utils";
import { SHAPE_TYPES } from "../utils/constant";

export interface CIRCLE {
    radius: number;
    radius_unit: MEASUREMENT;
}

export interface CIRCLE_SHAPE extends BASE_SHAPE, CIRCLE { };

export const getCircleDefaultProps: (x: number, y: number) => CIRCLE_SHAPE = (x: number, y: number) => {
    const defaultCircleProps: CIRCLE_SHAPE = {
        ...getBaseToolDefaultProps({ x, y, type: SHAPE_TYPES.CIRCLE }),
        radius: 40,
        radius_unit: 'px'
    };
    return defaultCircleProps;
};


const Circle: React.FC<WRAPPED_SHAPE_PROPS> = function (props) {
    const shape = props.shape as CIRCLE_SHAPE;
    return (
        <circle
            cx={`${shape.x}${shape.x_unit}`}
            cy={`${shape.y}${shape.y_unit}`}
            r={`${shape.radius}${shape.radius_unit}`}
            id={shape.id}
            onMouseDown={props.mouseDownHandler}
            onMouseUp={props.mouseUpHandler}
            onMouseEnter={props.mouseEnterHandler}
            onMouseLeave={props.mouseLeaveHandler}
            className={props.hovered || props.isActive ? 'active' : 'inactive'}
            {...getStyleObj(shape.style)}
            transform-origin={`${shape.x} ${shape.y}`}
        />
    );
}

export default BaseTool(Circle);