import { State } from "../store/store";
import { AVAILABLE_SHAPES } from "../shapes/availableShapes";
import { SHAPE_TYPES } from "../utils/constant";
import { CONTEXT_MENU_INTERFACE, ACTIVE_SHAPE_INFO, GRADIENT } from "../actions/pages/pages.interface";
import { AVAILABLE_FILTERS } from "../filters/availableFilters";

// used in base shape , gets info about current shape being rendered in base shape
export function getCurrentShape(state: State, shapeIndex: number): AVAILABLE_SHAPES {
    const activePageIndex = state.page.activePageIndex;
    const activePage = state.page.pages[activePageIndex];
    const currentShape = activePage.shapes[shapeIndex];
    return currentShape;
}

export function getActiveShapesInfo(state: State): ACTIVE_SHAPE_INFO {
    const activePageIndex = state.page.activePageIndex;
    const activeShapes = state.page.pages[activePageIndex].activeShapes;
    return activeShapes;
}

export function getShapesOfCurrentPage(state: State): Array<AVAILABLE_SHAPES> {
    const activePageIndex = state.page.activePageIndex;
    const activePage = state.page.pages[activePageIndex];
    return activePage.shapes;
}

export function getActiveTool(state: State): SHAPE_TYPES {
    return state.page.activeTool;
}

export function getHoveredShapeId(state: State): string | null {
    return state.page.hoveredShapeId;
}

export function getTotalShapes(state: State): number {
    const activePageIndex = state.page.activePageIndex;
    const activePage = state.page.pages[activePageIndex];
    return activePage.shapes.length;
}

export function getActiveShapes(state: State): Array<AVAILABLE_SHAPES> {
    const activePageIndex = state.page.activePageIndex;
    const activePage = state.page.pages[activePageIndex];
    const shapes = activePage.shapes;
    const activeShapes = state.page.pages[activePageIndex].activeShapes;
    return activeShapes.map(shapeIndex => {
        return shapes[shapeIndex.index];
    });
}

export function getContextMenuState(state: State): CONTEXT_MENU_INTERFACE {
    return state.page.contextMenu;
}

export function getClipBoard(state: State): Array<AVAILABLE_SHAPES> {
    return state.page.clipboard;
}

export function getShapeAtIndex(state: State): (index: number) => AVAILABLE_SHAPES {
    const activePageIndex = state.page.activePageIndex;
    const activePage = state.page.pages[activePageIndex];
    const shapes = activePage.shapes;
    return function (index: number): AVAILABLE_SHAPES {
        return shapes[index];
    }
}

export function getFiltersOfCurrentPage(state: State): { [key: string]: AVAILABLE_FILTERS; } {
    const activePageIndex = state.page.activePageIndex;
    const activePage = state.page.pages[activePageIndex];
    return activePage.filters;
}

export function getCurrentProjectColors(state: State): { [key: string]: string; } {
    return state.page.colors;
}

export function getCurrentProjectGradients(state: State): { [key: string]: GRADIENT; } {
    return state.page.gradients;
}