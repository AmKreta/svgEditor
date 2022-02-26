import { PAGES_ACTION_TYPES } from "./pages.actionTypes";
import { SHAPE_TYPES } from "../../utils/constant";
import { getCircleDefaultProps } from "../../shapes/circle";
import { getRectangleDefaultProps } from "../../shapes/rectangle";
import { getPolygonDefaultProps } from "../../shapes/polygon";
import { getPolylineDefaultProps } from "../../shapes/polyline";
import {
    SET_ACTIVE_PAGE_PAYLOAD,
    SET_ACTIVE_PAGE_ACTION,
    ADD_SHAPE_PAYLOAD,
    ADD_SHAPE_ACTION,
    SET_ACTIVE_SHAPE_COORDINATES_ACTION,
    SET_ACTIVE_SHAPE_COORDINATES_PAYLOAD,
    SET_ACTIVE_TOOL_PAYLOAD,
    SET_ACTIVE_TOOL_ACTION,
    SET_HOVERED_SHAPE_ACTION,
    SET_HOVERED_SHAPE_PAYLOAD,
    SET_ACTIVE_SHAPE_ACTION,
    SET_ACTIVE_SHAPE_PAYLOAD,
    TOGGLE_CONTEXT_MENU_ACTION,
    TOGGLE_CONTEXT_MENU_PAYLOAD,
    CUT_SELECTED_SHAPES_ACTION,
    PASTE_SELECTED_SHAPES_ACTION,
    COPY_SELECTED_SHAPES_ACTION,
    REMOVE_SELECTED_SHAPES_ACTION,
    SAVE_SELECTED_SHAPES_AS_GROUP_ACTION,
    RENAME_SHAPE_PAYLOAD,
    RENAME_SHAPE_ACTION,
    FORMAT_ACTIVE_SHAPE_ACTION,
    FORMAT_ACTIVE_SHAPE_PAYLOAD,
    ADD_SVG_FILTERS_PAYLOAD,
    ADD_SVG_FILTERS_ACTION,
    EDIT_SVG_FILTER_ACTION,
    EDIT_SVG_FILTER_Payload,
    REMOVE_SVG_FILTER_ACTION,
    REMOVE_SVG_FILTER_PAYLOAD,
    ADD_COLOR_IN_PALETTE_ACTION,
    ADD_COLOR_IN_PALETTE_PAYLOAD,
    EDIT_PALETTE_COLOR_ACTION,
    EDIT_PALETTE_COLOR_PAYLOAD,
    REMOVE_PALETTE_COLOR_ACTION,
    REMOVE_PALETTE_COLOR_PAYlOAD
} from "./pages.interface";
import { getImageDefaultProps } from "../../shapes/image";
import { getLineDefaultProps } from "../../shapes/line";
import { getEllipseDefaultProps } from "../../shapes/ellipse";
import { getTextDefaultProps } from "../../shapes/text";

export const setActivePage: (index: SET_ACTIVE_PAGE_PAYLOAD) => SET_ACTIVE_PAGE_ACTION = (index: SET_ACTIVE_PAGE_PAYLOAD) => {
    return { type: PAGES_ACTION_TYPES.SET_ACTIVE_PAGE, payload: index };
}

export const addShape: (shape: ADD_SHAPE_PAYLOAD) => ADD_SHAPE_ACTION | undefined = ({ shape, x, y, pointsArray = [] }: ADD_SHAPE_PAYLOAD) => {
    let newShapeDefaultProps;
    switch (shape) {
        case SHAPE_TYPES.CIRCLE: {
            newShapeDefaultProps = getCircleDefaultProps(x, y);
            break;
        }
        case SHAPE_TYPES.RECTANGLE: {
            newShapeDefaultProps = getRectangleDefaultProps(x, y);
            break;
        }
        case SHAPE_TYPES.POLYGON: {
            newShapeDefaultProps = getPolygonDefaultProps(pointsArray);
            break;
        }

        case SHAPE_TYPES.POLYLINE: {
            newShapeDefaultProps = getPolylineDefaultProps(pointsArray);
            break;
        }

        case SHAPE_TYPES.IMAGE: {
            newShapeDefaultProps = getImageDefaultProps(x, y);
            break;
        }

        case SHAPE_TYPES.LINE: {
            newShapeDefaultProps = getLineDefaultProps(pointsArray);
            break;
        }

        case SHAPE_TYPES.ELLIPSE: {
            newShapeDefaultProps = getEllipseDefaultProps(x, y);
            break;
        }

        case SHAPE_TYPES.TEXT: {
            newShapeDefaultProps = getTextDefaultProps(x, y);
            break;
        }

        default: return;
    }
    if (newShapeDefaultProps) {
        return { type: PAGES_ACTION_TYPES.ADD_SHAPE, payload: newShapeDefaultProps };
    }
}

export const setActiveShapeCoordinates: (coordinates: SET_ACTIVE_SHAPE_COORDINATES_PAYLOAD) => SET_ACTIVE_SHAPE_COORDINATES_ACTION = (coordinates: SET_ACTIVE_SHAPE_COORDINATES_PAYLOAD) => {
    return { type: PAGES_ACTION_TYPES.SET_ACTIVE_SHAPE_COORDINATES, payload: coordinates };
}

export const setActiveTool: (tool: SET_ACTIVE_TOOL_PAYLOAD) => SET_ACTIVE_TOOL_ACTION = (tool: SET_ACTIVE_TOOL_PAYLOAD) => {
    return { type: PAGES_ACTION_TYPES.SET_ACTIVE_TOOL, payload: tool };
}

export const setHoveredShape: (hoveredToolId: SET_HOVERED_SHAPE_PAYLOAD) => SET_HOVERED_SHAPE_ACTION = (hoveredToolId: SET_HOVERED_SHAPE_PAYLOAD) => {
    return { type: PAGES_ACTION_TYPES.SET_HOVERED_SHAPE, payload: hoveredToolId };
}

export const setActiveShape: (activeShapeArray: SET_ACTIVE_SHAPE_PAYLOAD) => SET_ACTIVE_SHAPE_ACTION = (ActiveShapeArray: SET_ACTIVE_SHAPE_PAYLOAD) => {
    return { type: PAGES_ACTION_TYPES.SET_ACTIVE_SHAPE, payload: ActiveShapeArray };
}

export const toggleContextMenu: (coordinates?: TOGGLE_CONTEXT_MENU_PAYLOAD) => TOGGLE_CONTEXT_MENU_ACTION = (coordinates?: TOGGLE_CONTEXT_MENU_PAYLOAD) => {
    return { type: PAGES_ACTION_TYPES.TOGGLE_CONTEXT_MENU, payload: coordinates };
}

export const cutSelectedShapes: () => CUT_SELECTED_SHAPES_ACTION = () => {
    return { type: PAGES_ACTION_TYPES.CUT_SELECTED_SHAPES, payload: undefined }
}

export const pasteSelectedShape: () => PASTE_SELECTED_SHAPES_ACTION = () => {
    return { type: PAGES_ACTION_TYPES.PASTE_SELECTED_SHAPES, payload: undefined };
}

export const copySelectedShapes: () => COPY_SELECTED_SHAPES_ACTION = () => {
    return { type: PAGES_ACTION_TYPES.COPY_SELECTED_SHAPES, payload: undefined };
}

export const removeSelectedShapes: () => REMOVE_SELECTED_SHAPES_ACTION = () => {
    return { type: PAGES_ACTION_TYPES.REMOVE_SELECTED_SHAPES, payload: undefined };
}

export const saveSelectedShapesAsGroup: () => SAVE_SELECTED_SHAPES_AS_GROUP_ACTION = () => {
    return { type: PAGES_ACTION_TYPES.SAVE_SELECTED_SHAPES_AS_GROUP, payload: undefined };
}

export const setShapeName: (shapeInfo: RENAME_SHAPE_PAYLOAD) => RENAME_SHAPE_ACTION = (shapeInfo: RENAME_SHAPE_PAYLOAD) => {
    return { type: PAGES_ACTION_TYPES.RENAME_SHAPE, payload: shapeInfo };
}

export const formatActiveShape: (properties: FORMAT_ACTIVE_SHAPE_PAYLOAD) => FORMAT_ACTIVE_SHAPE_ACTION = (properties: FORMAT_ACTIVE_SHAPE_PAYLOAD) => {
    return { type: PAGES_ACTION_TYPES.FORMAT_ACTIVE_SHAPE, payload: properties };
}

export const addSvgFilters: (defaultFilterValues: ADD_SVG_FILTERS_PAYLOAD) => ADD_SVG_FILTERS_ACTION = (defaultFilterValues: ADD_SVG_FILTERS_PAYLOAD) => {
    return { type: PAGES_ACTION_TYPES.ADD_SVG_FILTERS, payload: defaultFilterValues };
}

export const editSvgFilter: (props: EDIT_SVG_FILTER_Payload) => EDIT_SVG_FILTER_ACTION = (props: EDIT_SVG_FILTER_Payload) => {
    return { type: PAGES_ACTION_TYPES.EDIT_SVG_FILTER, payload: props };
}

export const removeSvgFilter: (props: REMOVE_SVG_FILTER_PAYLOAD) => REMOVE_SVG_FILTER_ACTION = (props: REMOVE_SVG_FILTER_PAYLOAD) => {
    return { type: PAGES_ACTION_TYPES.REMOVE_SVG_FILTER, payload: props };
}

export const addColorInPalette: (color: ADD_COLOR_IN_PALETTE_PAYLOAD) => ADD_COLOR_IN_PALETTE_ACTION = (color: ADD_COLOR_IN_PALETTE_PAYLOAD) => {
    return { type: PAGES_ACTION_TYPES.ADD_COLOR_IN_PALETTE, payload: color };
}

export const editColorPalette = function (props: EDIT_PALETTE_COLOR_PAYLOAD): EDIT_PALETTE_COLOR_ACTION {
    return { type: PAGES_ACTION_TYPES.EDIT_PALETTE_COLOR, payload: props };
}

export const removePaletteColor = function (id: REMOVE_PALETTE_COLOR_PAYlOAD): REMOVE_PALETTE_COLOR_ACTION {
    return { type: PAGES_ACTION_TYPES.REMOVE_PALETTE_COLOR, payload: id };
}