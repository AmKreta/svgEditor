import pagesReducer from "./pages.reducer";
import { combineReducers } from "redux";

const rootReducer=combineReducers({
    page:pagesReducer
});

export default rootReducer;