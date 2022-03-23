import BaseTool, { BASE_SHAPE, getBaseToolDefaultProps, WRAPPED_SHAPE_PROPS } from "./baseShapes";
import { MEASUREMENT } from './style';
import { getStyleObj } from "../utils/utils";
import { SHAPE_TYPES } from "../utils/constant";
import defaultImage from '../assets/defaultImage.png';

interface IMAGE {
    height: number;
    height_unit: MEASUREMENT;
    width: number;
    width_unit: MEASUREMENT;
    base64Url: string
};

export interface IMAGE_SHAPE extends BASE_SHAPE, IMAGE { };

export const getImageDefaultProps: (x: number, y: number, src: string) => IMAGE_SHAPE = (x: number, y: number, src: string) => {
    const defaultImageProps: IMAGE_SHAPE = {
        ...getBaseToolDefaultProps({ x, y, type: SHAPE_TYPES.IMAGE }),
        height: 200,
        height_unit: 'px',
        width: 200,
        width_unit: 'px',
        base64Url: src || defaultImage,
    };
    return defaultImageProps;
}

const Rectangle: React.FC<WRAPPED_SHAPE_PROPS> = function (props) {
    const shape = props.shape as IMAGE_SHAPE;
    return (
        <image
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
            preserveAspectRatio={'true'}
            href={shape.base64Url}
        />
    );
}
export default BaseTool(Rectangle);