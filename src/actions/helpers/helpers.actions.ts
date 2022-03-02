import {
    TOGGLE_GRID_HELPERS_ACTION,
    TOGGLE_POINTER_HELPERS_ACTION,
    TOGGLE_SHAPE_HELPERS_ACTION
} from './helpers.interface';
import { HEPLERS_ACTIONS_TYPES } from './helpers.actionTypes';

export function toggleGridHelpers(): TOGGLE_GRID_HELPERS_ACTION {
    return { type: HEPLERS_ACTIONS_TYPES.TOGGLE_GRID_HEPLER };
}

export function togglePointerHelpers(): TOGGLE_POINTER_HELPERS_ACTION {
    return { type: HEPLERS_ACTIONS_TYPES.TOGGLE_POINTER_HELPER };
}

export function toggleShapeHelpers(): TOGGLE_SHAPE_HELPERS_ACTION {
    return { type: HEPLERS_ACTIONS_TYPES.TOGGLE_SHAPE_HELPER };
}