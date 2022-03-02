import { HELPERS, HELPERS_ACTIONS } from '../actions/helpers/helpers.interface';
import { HEPLERS_ACTIONS_TYPES } from '../actions/helpers/helpers.actionTypes';

const initialState: HELPERS = {
    gridHelpers: false,
    pointerHelpers: false,
    shapeHelpers: false
};

const helpersReducer = (state: HELPERS = initialState, action: HELPERS_ACTIONS): HELPERS => {
    switch (action.type) {
        case HEPLERS_ACTIONS_TYPES.TOGGLE_GRID_HEPLER: {
            return { ...state, gridHelpers: !state.gridHelpers };
        }
        case HEPLERS_ACTIONS_TYPES.TOGGLE_POINTER_HELPER: {
            return { ...state, pointerHelpers: !state.pointerHelpers };
        }
        case HEPLERS_ACTIONS_TYPES.TOGGLE_SHAPE_HELPER: {
            return { ...state, shapeHelpers: !state.shapeHelpers };
        }
        default:
            return state;
    }
}

export default helpersReducer;