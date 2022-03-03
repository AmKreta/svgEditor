import { PAGE_ACTION } from "../actions/pages/pages.interface";
import { PAGES_ACTION_TYPES } from "../actions/pages/pages.actionTypes";
import generateId from "../utils/idGenerator";
import { PAGES } from "../actions/pages/pages.interface";
import { Reducer } from "redux";
import { multiPointShpes, SHAPE_TYPES } from "../utils/constant";
import { AVAILABLE_SHAPES } from "../shapes/availableShapes";
import { getGroupDefaultProps, GROUP_SHAPE } from "../shapes/group";
import { POLYGON_SHAPE } from "../shapes/polygon";
import { cloneDeep } from 'lodash';

const id = generateId();

const initialState: PAGES = {
    activePageIndex: 0,
    activeTool: SHAPE_TYPES.PAN,
    hoveredShapeId: null,
    clipboard: [],
    contextMenu: { show: false, x: 0, y: 0 },
    pages: [
        { id: id, activeShapes: [], shapes: [], filters: {} }
    ],
    colors: {},
    gradients: {},
    images: {}
}

const pagesReducer: Reducer<PAGES, PAGE_ACTION> = function (state: PAGES = initialState, action: PAGE_ACTION): PAGES {
    switch (action.type) {

        case PAGES_ACTION_TYPES.SET_ACTIVE_PAGE: {
            return { ...state, activePageIndex: action.payload };
        }

        case PAGES_ACTION_TYPES.ADD_SHAPE: {
            const currentPage = state.pages[state.activePageIndex];
            if (currentPage) {
                let shapes = currentPage.shapes;
                currentPage.shapes = [...shapes, action.payload];
                currentPage.activeShapes = [{ index: currentPage.shapes.length - 1, id: action.payload.id }];
                return { ...state, pages: [...state.pages] }
            }
            return state;
        }

        case PAGES_ACTION_TYPES.SET_ACTIVE_SHAPE_COORDINATES: {
            const currentPage = state.pages[state.activePageIndex];
            if (currentPage) {
                currentPage.activeShapes.forEach((shapeInfo) => {
                    const shape = currentPage.shapes[shapeInfo.index];
                    if (shape.type === SHAPE_TYPES.GROUP) {
                        let children = (shape as GROUP_SHAPE).children;
                        children.forEach(child => {
                            if (multiPointShpes.includes(child.type)) {
                                (child as POLYGON_SHAPE).points.forEach(points => {
                                    points[0] += action.payload.x;
                                    points[1] += action.payload.y;
                                });
                            }
                            else {
                                child.x += action.payload.x;
                                child.y += action.payload.y;
                            }
                        });
                        children = [...children];
                    }

                    else if (multiPointShpes.includes(shape.type)) {
                        (shape as POLYGON_SHAPE).points.forEach((point) => {
                            point[0] += action.payload.x;
                            point[1] += action.payload.y;
                        });
                    }

                    else {
                        shape.x += action.payload.x;
                        shape.y += action.payload.y;
                    }
                    currentPage.shapes[shapeInfo.index] = { ...shape };
                });
                return { ...state };
            }
            return state;
        }

        case PAGES_ACTION_TYPES.SET_ACTIVE_TOOL: {
            return { ...state, activeTool: action.payload };
        }

        case PAGES_ACTION_TYPES.SET_HOVERED_SHAPE: {
            return { ...state, hoveredShapeId: action.payload };
        }

        case PAGES_ACTION_TYPES.SET_ACTIVE_SHAPE: {
            const currentPage = state.pages[state.activePageIndex];
            if (currentPage) {
                currentPage.activeShapes = action.payload;
                return { ...state, pages: [...state.pages] };
            }
            return state;
        }

        case PAGES_ACTION_TYPES.TOGGLE_CONTEXT_MENU: {
            state.contextMenu = action.payload
                ? { show: true, ...action.payload }
                : { show: false, x: 0, y: 0 }
            return { ...state };
        }

        case PAGES_ACTION_TYPES.CUT_SELECTED_SHAPES: {
            const currentPage = state.pages[state.activePageIndex];
            // shape is object with full shape description
            // activeShapes only contaibn id and index of activeShapes
            let shapes = currentPage.shapes;
            const activeShapes = currentPage.activeShapes;
            const clipboard: AVAILABLE_SHAPES[] = [];
            // adding active shapes to clipboard
            // keeping inactive shapes as it it
            shapes = shapes.filter(shape => {
                const isShapeActive = activeShapes.find(shapeInfo => shapeInfo.id === shape.id);
                if (isShapeActive) {
                    clipboard.push(shape);
                    return false;
                }
                return shape;
            })
            currentPage.shapes = [...shapes];
            // clearing activeshapes array
            currentPage.activeShapes = [];
            return { ...state, clipboard };
        }

        case PAGES_ACTION_TYPES.COPY_SELECTED_SHAPES: {
            const currentPage = state.pages[state.activePageIndex];
            // shape is object with full shape description
            // activeShapes only contaibn id and index of activeShapes
            const shapes = currentPage.shapes;
            const activeShapes = currentPage.activeShapes;
            const clipboard: AVAILABLE_SHAPES[] = [];
            // adding active shapes to clipboard
            // keeping inactive shapes as it it
            shapes.forEach(shape => {
                const isShapeActive = activeShapes.find(shapeInfo => shapeInfo.id === shape.id);
                if (isShapeActive) {
                    clipboard.push(shape);
                }
            })
            currentPage.shapes = [...shapes];
            return { ...state, clipboard };
        }

        case PAGES_ACTION_TYPES.PASTE_SELECTED_SHAPES: {
            // the coodrinate where context menu is being displayed
            const { x, y } = state.contextMenu;
            // avg of x and y coordinates of all active shapes
            let avgX = 0, avgY = 0;
            state.clipboard.forEach(item => {
                if (item.type === SHAPE_TYPES.GROUP) {
                    let x=0,y=0;
                    (item as GROUP_SHAPE).children.forEach(child=>{x+=child.x;y+=child.y;});
                    x/=(item as GROUP_SHAPE).children.length;
                    y/=(item as GROUP_SHAPE).children.length;
                    avgX+=x;
                    avgY+=y;
                }
                else {
                    avgX += item.x;
                    avgY += item.y;
                }
            });
            avgX /= state.clipboard.length;
            avgY /= state.clipboard.length;
            let dx = x - avgX;
            let dy = y - avgY;
            // adding new coordinates and id's to shapes on clipboard
            const shapesToPaste: AVAILABLE_SHAPES[] = state.clipboard.map(item => {
                let newShape: AVAILABLE_SHAPES;
                newShape = cloneDeep(item);
                newShape.id = generateId();
                newShape.x = item.x + dx;
                newShape.y = item.y + dy;
                if (newShape.type === SHAPE_TYPES.GROUP) {
                    // iterating over all children to give em new id's and coordinates
                    (newShape as GROUP_SHAPE).children = (newShape as GROUP_SHAPE).children.map(child => {
                        if (multiPointShpes.includes(child.type)) {
                            const newChild = cloneDeep(child);
                            newChild.id = generateId();
                            (newChild as POLYGON_SHAPE).points = (child as POLYGON_SHAPE).points.map(points => [points[0] + dx, points[1] + dy]);
                            return newChild;
                        }
                        const newChild = cloneDeep(child);
                        newChild.id = generateId();
                        newChild.x = child.x + dx;
                        newChild.y = child.y + dy;
                        return newChild;
                    });
                }
                else if (multiPointShpes.includes(newShape.type)) {
                    (newShape as POLYGON_SHAPE).points = (newShape as POLYGON_SHAPE).points.map(point => [point[0] + dx, point[1] + dy]);
                }
                return newShape;
            });
            const currentPage = state.pages[state.activePageIndex];
            // concatining newly shapes with existing shapes
            currentPage.shapes = [...currentPage.shapes, ...shapesToPaste];
            // setting these shapes as active shapes
            currentPage.activeShapes = [];
            for (let i = currentPage.shapes.length - shapesToPaste.length; i < currentPage.shapes.length; i++) {
                currentPage.activeShapes.push({
                    id: currentPage.shapes[i].id,
                    index: i
                });
            }
            return { ...state };
        }

        case PAGES_ACTION_TYPES.REMOVE_SELECTED_SHAPES: {
            const currentPage = state.pages[state.activePageIndex];
            // shape is object with full shape description
            // activeShapes only contaibn id and index of activeShapes
            let shapes = currentPage.shapes;
            const activeShapes = currentPage.activeShapes;
            shapes = shapes.filter(shape => {
                const isShapeActive = activeShapes.find(shapeInfo => shapeInfo.id === shape.id);
                return !isShapeActive;
            });
            currentPage.shapes = [...shapes];
            // clearing active shapes array
            currentPage.activeShapes = [];
            return { ...state };
        }

        case PAGES_ACTION_TYPES.SAVE_SELECTED_SHAPES_AS_GROUP: {
            const currentPage = state.pages[state.activePageIndex];
            const groupChildren: AVAILABLE_SHAPES[] = [];
            // removing active shapes from shapes array
            // adding active shapes to groupChildren array
            const shapes = currentPage.shapes.filter(shape => {
                const isShapeActive = currentPage.activeShapes.find(shapeInfo => shapeInfo.id === shape.id);
                if (isShapeActive) {
                    if (shape.type === SHAPE_TYPES.GROUP) {
                        // if shape type is group merge all items in a newly formed array
                        (shape as GROUP_SHAPE).children.forEach(child => {
                            groupChildren.push(child);
                        });
                        return false;
                    }
                    groupChildren.push(shape);
                    return false;
                }
                return shape;
            });
            // creating new group shape
            const newGroup: GROUP_SHAPE = getGroupDefaultProps(groupChildren);
            // assigning new shapes array to currentpage.shapes
            currentPage.shapes = [...shapes, newGroup];
            // setting newly created group as active shape
            currentPage.activeShapes = [{
                id: newGroup.id,
                index: currentPage.shapes.length - 1
            }];
            return { ...state };
        }

        case PAGES_ACTION_TYPES.FORMAT_ACTIVE_SHAPE: {
            const { index, style = {}, properties = {} } = action.payload;
            const currentPage = state.pages[state.activePageIndex];
            // shape is object with full shape description
            // activeShapes only contaibn id and index of activeShapes
            let shape = currentPage.shapes[index];
            shape.style = { ...shape.style, ...style };

            currentPage.shapes[index] = { ...shape, ...properties as any };
            return { ...state };
        }

        case PAGES_ACTION_TYPES.ADD_SVG_FILTERS: {
            let currentPage = state.pages[state.activePageIndex];
            const filters = { ...currentPage.filters };
            filters[action.payload.id] = action.payload;
            currentPage.filters = filters;
            currentPage = { ...currentPage };
            return { ...state };
        }

        case PAGES_ACTION_TYPES.EDIT_SVG_FILTER: {
            let currentPage = state.pages[state.activePageIndex];
            const filters = { ...currentPage.filters };
            filters[action.payload.id] = action.payload.newFilter;
            currentPage.filters = filters;
            currentPage = { ...currentPage };
            return { ...state };
        }

        case PAGES_ACTION_TYPES.REMOVE_SVG_FILTER: {

            console.log(action.payload);

            //deleting from filters array
            let currentPage = state.pages[state.activePageIndex];
            const filters = { ...currentPage.filters };
            delete filters[action.payload.filterId];
            currentPage.filters = filters;

            //deleting from shape
            const currentShape = currentPage.shapes[action.payload.shapeIndex];
            const svgFilters = currentShape.style.svgFilters;
            svgFilters[action.payload.filterType] = svgFilters[action.payload.filterType]?.filter(filterId => filterId !== action.payload.filterId);
            if (svgFilters[action.payload.filterType]?.length === 0) {
                delete svgFilters[action.payload.filterType]
            }

            currentShape.style.svgFilters = { ...svgFilters };
            currentPage = { ...currentPage };
            return { ...state };
        }

        case PAGES_ACTION_TYPES.ADD_COLOR_IN_PALETTE: {
            const colors = { ...state.colors };
            colors[generateId()] = action.payload;
            state.colors = colors;
            return { ...state };
        }

        case PAGES_ACTION_TYPES.EDIT_PALETTE_COLOR: {
            const colors = { ...state.colors };
            colors[action.payload.id] = action.payload.color;
            state.colors = colors;
            return { ...state };
        }

        case PAGES_ACTION_TYPES.REMOVE_PALETTE_COLOR: {
            const colors = { ...state.colors };
            delete colors[action.payload];
            console.log(colors, action.payload);
            state.colors = colors;
            return { ...state };
        }

        case PAGES_ACTION_TYPES.ADD_GRADIENT_IN_PALETTE: {
            const gradients = { ...state.gradients };
            gradients[generateId()] = action.payload;
            state.gradients = gradients;
            return { ...state };
        }

        case PAGES_ACTION_TYPES.EDIT_PALETTE_GRADIENT: {
            const gradients = { ...state.gradients };
            gradients[action.payload.id] = action.payload.newGradient;
            state.gradients = gradients;
            return { ...state };
        }

        case PAGES_ACTION_TYPES.REMOVE_PALETTE_GRADIENT: {
            const gradients = { ...state.gradients };
            delete gradients[action.payload];
            state.gradients = gradients;
            return { ...state };
        }

        default: return state;
    }
};

export default pagesReducer;



