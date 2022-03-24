import React from "react";
import BaseTool, { BASE_SHAPE, WRAPPED_SHAPE_PROPS, getBaseToolDefaultProps } from "./baseShapes";
import { MEASUREMENT } from './style';
import { getStyleObj } from "../utils/utils";
import { SHAPE_TYPES } from "../utils/constant";

export interface ELLIPSE {
    radiusX: number;
    radiusX_unit: MEASUREMENT;
    radiusY: number;
    radiusY_unit: MEASUREMENT;
}

export interface ELLIPSE_SHAPE extends BASE_SHAPE, ELLIPSE { };

export const getEllipseDefaultProps: (x: number, y: number) => ELLIPSE_SHAPE = (x: number, y: number) => {
    const defaultCircleProps: ELLIPSE_SHAPE = {
        ...getBaseToolDefaultProps({ x, y, type: SHAPE_TYPES.ELLIPSE }),
        radiusX: 80,
        radiusX_unit: 'px',
        radiusY: 40,
        radiusY_unit: 'px'
    };
    return defaultCircleProps;
};


const Ellipse: React.FC<WRAPPED_SHAPE_PROPS> = function (props) {
    const shape = props.shape as ELLIPSE_SHAPE;
    return (
        <ellipse
            cx={`${shape.x}${shape.x_unit}`}
            cy={`${shape.y}${shape.y_unit}`}
            rx={`${shape.radiusX}${shape.radiusX_unit}`}
            ry={`${shape.radiusY}${shape.radiusY_unit}`}
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

export default BaseTool(Ellipse);