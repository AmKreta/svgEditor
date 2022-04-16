import React, { useRef, useState, useLayoutEffect } from "react";
import BaseTool, { BASE_SHAPE, WRAPPED_SHAPE_PROPS, getBaseToolDefaultProps } from "./baseShapes";
import { getBoundingRectMidPoint, getStyleObj } from "../utils/utils";
import { SHAPE_TYPES } from "../utils/constant";

export interface TEXT {
    text: string;
    fontSize: number;
    fontWeight: number;
    fontStyle: 'normal' | 'italic' | 'oblique';
    fontFamily: string;
    genericFontFamily: 'serif' | 'sans-serif' | 'cursive' | 'fantasy' | 'monospace';
}

export interface TEXT_SHAPE extends BASE_SHAPE, TEXT { };

export const getTextDefaultProps: (x: number, y: number) => TEXT_SHAPE = (x: number, y: number) => {
    const defaultTextProps: TEXT_SHAPE = {
        ...getBaseToolDefaultProps({ x, y, type: SHAPE_TYPES.TEXT }),
        text: 'ENTER TEXT HERE',
        fontSize: 30,
        fontWeight: 400,
        fontStyle: 'normal',
        fontFamily: 'Arial',
        genericFontFamily: 'sans-serif'
    };
    return defaultTextProps;
};


const Text: React.FC<WRAPPED_SHAPE_PROPS> = function (props) {
    const shape = props.shape as TEXT_SHAPE;
    const ref = useRef<SVGTextElement>(null);
    const [midPoint, setMidpoint] = useState({ x: 0, y: 0 });

    useLayoutEffect(function () {
        setMidpoint(getBoundingRectMidPoint(ref.current?.getBBox()));
    }, [shape.x, shape.y]);

    return (
        <text
            x={`${shape.x}${shape.x_unit}`}
            y={`${shape.y}${shape.y_unit}`}
            id={shape.id}
            onMouseDown={props.mouseDownHandler}
            onMouseUp={props.mouseUpHandler}
            onMouseEnter={props.mouseEnterHandler}
            onMouseLeave={props.mouseLeaveHandler}
            className={props.hovered || props.isActive ? 'active' : 'inactive'}
            fontSize={shape.fontSize}
            fontWeight={shape.fontWeight}
            fontStyle={shape.fontStyle}
            {...getStyleObj(shape.style)}
            ref={ref}
            transform-origin={`${midPoint.x} ${midPoint.y}`}
            font-family={`${shape.fontFamily}, ${shape.genericFontFamily}`}
        >
            {shape.text}
        </text>
    );
}

export default BaseTool(Text);