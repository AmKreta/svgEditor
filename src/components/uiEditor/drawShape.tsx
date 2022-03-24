import React from 'react';
import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import { SHAPE_TYPES } from '../../utils/constant';
import Circle from '../../shapes/circle';
import Rectangle from '../../shapes/rectangle';
import Group from '../../shapes/group';
import Polygon from '../../shapes/polygon';
import Polyline from '../../shapes/polyline';
import Image from '../../shapes/image';
import Line from '../../shapes/line';
import Ellipse from '../../shapes/ellipse';
import Text from '../../shapes/text';
import Path from '../../shapes/path';

interface DRAW_SHAPES_PROPS {
    shape: AVAILABLE_SHAPES;
    hovered: boolean;
    isActive: boolean;
}

const DrawShapes: React.FC<DRAW_SHAPES_PROPS> = function ({ shape, isActive, hovered }) {
    switch (shape.type) {

        case SHAPE_TYPES.CIRCLE: return (
            <Circle
                isActive={isActive}
                id={shape.id}
                hovered={hovered}
            />
        );

        case SHAPE_TYPES.RECTANGLE: return (
            <Rectangle
                isActive={isActive}
                id={shape.id}
                hovered={hovered}
            />
        )

        case SHAPE_TYPES.GROUP: return (
            <Group
                isActive={isActive}
                id={shape.id}
                hovered={hovered}
            />
        );

        case SHAPE_TYPES.POLYGON: return (
            <Polygon
                isActive={isActive}
                id={shape.id}
                hovered={hovered}
            />
        )

        case SHAPE_TYPES.POLYLINE: return (
            <Polyline
                isActive={isActive}
                id={shape.id}
                hovered={hovered}
            />
        );

        case SHAPE_TYPES.IMAGE: return (
            <Image
                isActive={isActive}
                id={shape.id}
                hovered={hovered}
            />
        );

        case SHAPE_TYPES.LINE: return (
            <Line
                isActive={isActive}
                id={shape.id}
                hovered={hovered}
            />
        );

        case SHAPE_TYPES.ELLIPSE: return (
            <Ellipse
                isActive={isActive}
                id={shape.id}
                hovered={hovered}
            />
        )

        case SHAPE_TYPES.TEXT: return (
            <Text
                isActive={isActive}
                id={shape.id}
                hovered={hovered}
            />
        );

        case SHAPE_TYPES.PATH: {
            return <Path
                isActive={isActive}
                id={shape.id}
                hovered={hovered}
            />
        }

        default: return null;
    }
}

export default DrawShapes;