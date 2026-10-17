import pagesReducer from "./pages.reducer";
import helpersReducer from "./helpers.reducer";
import timelineReducer from "./timeline.reducer";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
    page: pagesReducer,
    helpers: helpersReducer,
    timeline: timelineReducer
});

export default rootReducer;