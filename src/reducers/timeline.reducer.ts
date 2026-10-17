import { Reducer } from 'redux';
import { TIMELINE_ACTION, TIMELINE_ACTION_TYPES, TIMELINE_UI_STATE } from '../actions/timeline/timeline.actions';

const initialState: TIMELINE_UI_STATE = {
    time: 0,
    playing: false,
    preview: null,
    recording: null,
};

const timelineReducer: Reducer<TIMELINE_UI_STATE, TIMELINE_ACTION> = function (state = initialState, action) {
    switch (action.type) {
        case TIMELINE_ACTION_TYPES.SET_PLAYBACK:
            return { ...state, ...action.payload };
        case TIMELINE_ACTION_TYPES.SET_RECORDING:
            return { ...state, recording: action.payload };
        default:
            return state;
    }
};

export default timelineReducer;
