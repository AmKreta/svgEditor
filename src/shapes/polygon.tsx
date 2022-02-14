import BaseTool, { BASE_SHAPE, getBaseToolDefaultProps, WRAPPED_SHAPE_PROPS } from "./baseShapes";
import { getStyleObj, getTransformOrigin } from "../utils/utils";
import { SHAPE_TYPES } from "../utils/constant";

interface POLYGON {
    points: Array<[number, number]>
};

export interface POLYGON_SHAPE extends BASE_SHAPE, POLYGON { };

export const getPolygonDefaultProps: (points: Array<[number, number]>) => POLYGON_SHAPE = (points: Array<[number, number]>) => {
    const defaultCircleProps: POLYGON_SHAPE = {
        ...getBaseToolDefaultProps({ x: 0, y: 0, type: SHAPE_TYPES.POLYGON }),
        points
    };
    return defaultCircleProps;
}

const Polygon: React.FC<WRAPPED_SHAPE_PROPS> = function (props) {
    const shape = props.shape as POLYGON_SHAPE;
    const transformOrigin = getTransformOrigin(shape.points);

    return (
        <polygon
            id={shape.id}
            data-index={props.index}
            onMouseDown={props.mouseDownHandler}
            onMouseUp={props.mouseUpHandler}
            onMouseEnter={props.mouseEnterHandler}
            onMouseLeave={props.mouseLeaveHandler}
            className={props.hovered || props.isActive ? 'active' : 'inactive'}
            {...getStyleObj(shape.style)}
            points={shape.points.toString()}
            transform-origin={transformOrigin}
        />
    );
}
export default BaseTool(Polygon);