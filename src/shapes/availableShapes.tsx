import { CIRCLE_SHAPE } from "./circle";
import { ELLIPSE_SHAPE } from "./ellipse";
import { GROUP_SHAPE } from "./group";
import { IMAGE_SHAPE } from "./image";
import { LINE_SHAPE } from "./line";
import { POLYGON_SHAPE } from "./polygon";
import { POLYLINE_SHAPE } from "./polyline";
import { RECTANGLE_SHAPE } from "./rectangle";
import { TEXT_SHAPE } from "./text";

export type AVAILABLE_SHAPES = CIRCLE_SHAPE
    | RECTANGLE_SHAPE
    | GROUP_SHAPE
    | POLYGON_SHAPE
    | POLYLINE_SHAPE
    | LINE_SHAPE
    | ELLIPSE_SHAPE
    | TEXT_SHAPE
    | IMAGE_SHAPE;