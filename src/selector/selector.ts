import { State } from "../store/store";
import { AVAILABLE_SHAPES } from "../shapes/availableShapes";
import { SHAPE_TYPES } from "../utils/constant";
import { CONTEXT_MENU_INTERFACE, ACTIVE_SHAPE_INFO, GRADIENT, SVG_STYLE } from "../actions/pages/pages.interface";
import { AVAILABLE_FILTERS } from "../filters/availableFilters";
import { HELPERS } from "../actions/helpers/helpers.interface";
import { SHAPE_COLLECTION } from "../actions/pages/pages.interface";

// used in base shape , gets info about current shape being rendered in base shape
export function getCurrentShape(state: State, shapeId: string): AVAILABLE_SHAPES {
    const activePageIndex = state.page.activePageIndex;
    const activePage = state.page.pages[activePageIndex];
    const currentShape = activePage.shapes[shapeId];
    return currentShape;
}

export function getActiveShapesInfo(state: State): string[] {
    const activePageIndex = state.page.activePageIndex;
    const activeShapes = state.page.pages[activePageIndex].activeShapes;
    return activeShapes;
}

export function getShapesOfCurrentPage(state: State): { [key: string]: AVAILABLE_SHAPES } {
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
    return Object.keys(activePage.shapes).length;
}

export function getActiveShapes(state: State): Array<AVAILABLE_SHAPES> {
    const activePageIndex = state.page.activePageIndex;
    const activePage = state.page.pages[activePageIndex];
    const shapes = activePage.shapes;
    const activeShapes = state.page.pages[activePageIndex].activeShapes;
    return activeShapes.map(shapeId => {
        return shapes[shapeId];
    });
}

export function getContextMenuState(state: State): CONTEXT_MENU_INTERFACE {
    return state.page.contextMenu;
}

export function getClipBoard(state: State): Array<AVAILABLE_SHAPES> {
    return state.page.clipboard;
}

export function getShapeWithId(state: State): (id: string) => AVAILABLE_SHAPES {
    const activePageIndex = state.page.activePageIndex;
    const activePage = state.page.pages[activePageIndex];
    const shapes = activePage.shapes;
    return function (id: string): AVAILABLE_SHAPES {
        return shapes[id];
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

export function getHelpers(state: State): HELPERS {
    return state.helpers;
}

export function getCurrentPage(state: State): SHAPE_COLLECTION[] {
    const activePage = state.page.pages;
    return activePage;
}

export function getActivePageIndex(state: State): number {
    return state.page.activePageIndex;
}

export function getCurrentDocName(state: State): string {
    return state.page.name;
}

export function getSvgStyle(state: State): SVG_STYLE {
    return state.page.pages[state.page.activePageIndex].svgStyle;
}

export function getCurrentDocumentSnapshots(state: State): string[] {
    return state.page.snapshots;
}

export function getCurrentDocumentPreview(state: State): string {
    return state.page.snapshots[0];
}

export function getCurrentDocId(state: State): string {
    return state.page.id;
}