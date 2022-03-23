import BaseTool, { BASE_SHAPE, getBaseToolDefaultProps, WRAPPED_SHAPE_PROPS } from "./baseShapes";
import { MEASUREMENT } from './style';
import { getStyleObj } from "../utils/utils";
import { SHAPE_TYPES } from "../utils/constant";

interface RECTANGLE {
    height: number;
    height_unit: MEASUREMENT;
    width: number;
    width_unit: MEASUREMENT;
    rx: number;
    ry: number;
};

export interface RECTANGLE_SHAPE extends BASE_SHAPE, RECTANGLE { };

export const getRectangleDefaultProps: (x: number, y: number) => RECTANGLE_SHAPE = (x: number, y: number) => {
    const defaultCircleProps: RECTANGLE_SHAPE = {
        ...getBaseToolDefaultProps({ x, y, type: SHAPE_TYPES.RECTANGLE }),
        height: 60,
        height_unit: 'px',
        width: 60,
        width_unit: 'px',
        rx: 0,
        ry: 0
    };
    return defaultCircleProps;
}

const Rectangle: React.FC<WRAPPED_SHAPE_PROPS> = function (props) {
    const shape = props.shape as RECTANGLE_SHAPE;
    return (
        <rect
            x={`${shape.x}${shape.x_unit}`}
            y={`${shape.y}${shape.y_unit}`}
            height={`${shape.height}${shape.height_unit}`}
            width={`${shape.width}${shape.width_unit}`}
            id={shape.id}
            onMouseDown={props.mouseDownHandler}
            onMouseUp={props.mouseUpHandler}
            onMouseEnter={props.mouseEnterHandler}
            onMouseLeave={props.mouseLeaveHandler}
            className={props.hovered || props.isActive ? 'active' : 'inactive'}
            {...getStyleObj(shape.style)}
            transform-origin={`${shape.x + shape.width / 2} ${shape.y + shape.height / 2}`}
            rx={shape.rx}
            ry={shape.ry}
        />
    );
}
export default BaseTool(Rectangle);