import React,{useState,useLayoutEffect,useRef} from 'react';
import BaseTool, { BASE_SHAPE, getBaseToolDefaultProps, WRAPPED_SHAPE_PROPS } from "./baseShapes";
import { getBoundingRectMidPoint, getStyleObj } from "../utils/utils";
import { SHAPE_TYPES } from "../utils/constant";

interface PATH {
    points: Array<[number, number]>
};

export interface PATH_SHAPE extends BASE_SHAPE, PATH { };

export const getPathDefaultProps: (points: Array<[number, number]>) => PATH_SHAPE = (points: Array<[number, number]>) => {
    const defaultPathProps: PATH_SHAPE = {
        ...getBaseToolDefaultProps({ x: 0, y: 0, type: SHAPE_TYPES.PATH }),
        points
    };
    return defaultPathProps;
}

const Path: React.FC<WRAPPED_SHAPE_PROPS> = function (props:WRAPPED_SHAPE_PROPS) {
    const shape = props.shape as PATH_SHAPE;
    const [midPoint,setMidPoint]=useState({x:0,y:0});
    const ref=useRef<SVGPathElement>(null);

    useLayoutEffect(function(){
        setMidPoint(getBoundingRectMidPoint(ref.current?.getBBox()));
    },[shape.points])

    return (
        <path
            id={shape.id}
            onMouseDown={props.mouseDownHandler}
            onMouseUp={props.mouseUpHandler}
            onMouseEnter={props.mouseEnterHandler}
            onMouseLeave={props.mouseLeaveHandler}
            className={props.hovered || props.isActive ? 'active' : 'inactive'}
            {...getStyleObj(shape.style)}
            d={(function () {
                let [p1, ...p] = shape.points || [[0, 0], [0, 0]];
                if (p1 && p) {
                    return `M ${p1[0]} ${p1[1]} C ${p.toString()}`;
                }
                return '';
            })()}
            transform-origin={`${midPoint.x} ${midPoint.y}`}
            ref={ref}
        />
    );
}
export default BaseTool(Path);