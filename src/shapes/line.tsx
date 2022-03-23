import BaseTool, { BASE_SHAPE, getBaseToolDefaultProps, WRAPPED_SHAPE_PROPS } from "./baseShapes";
import { getStyleObj, getTransformOrigin } from "../utils/utils";
import { SHAPE_TYPES } from "../utils/constant";

interface LINE {
    points: Array<[number, number]>
};

export interface LINE_SHAPE extends BASE_SHAPE, LINE { };

export const getLineDefaultProps: (points: Array<[number, number]>) => LINE_SHAPE = (points: Array<[number, number]>) => {
    const defaultLineProps: LINE_SHAPE = {
        ...getBaseToolDefaultProps({ x: 0, y: 0, type: SHAPE_TYPES.LINE }),
        points
    };
    return defaultLineProps;
}

const Polygon: React.FC<WRAPPED_SHAPE_PROPS> = function (props) {
    const shape = props.shape as LINE_SHAPE;

    const [[x1, y1], [x2, y2]] = shape.points;
    const transformOrigin = getTransformOrigin(shape.points);
    return (
        <line
            id={shape.id}
            onMouseDown={props.mouseDownHandler}
            onMouseUp={props.mouseUpHandler}
            onMouseEnter={props.mouseEnterHandler}
            onMouseLeave={props.mouseLeaveHandler}
            className={props.hovered || props.isActive ? 'active' : 'inactive'}
            {...getStyleObj(shape.style)}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            transform-origin={transformOrigin}
        />
    );
}
export default BaseTool(Polygon);