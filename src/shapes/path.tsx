import BaseTool, { BASE_SHAPE, getBaseToolDefaultProps, WRAPPED_SHAPE_PROPS } from "./baseShapes";
import { getStyleObj, getTransformOrigin } from "../utils/utils";
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

const Path: React.FC<WRAPPED_SHAPE_PROPS> = function (props) {
    const shape = props.shape as PATH_SHAPE;
    const transformOrigin = getTransformOrigin(shape.points);

    return (
        <path
            id={shape.id}
            data-index={props.index}
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
            transform-origin={transformOrigin}
        />
    );
}
export default BaseTool(Path);