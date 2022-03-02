import pagesReducer from "./pages.reducer";
import helpersReducer from "./helpers.reducer";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
    page: pagesReducer,
    helpers: helpersReducer
});

export default rootReducer;