import { createStore, Store, /*applyMiddleware*/ } from "redux";
//import logger from 'redux-logger';
import rootReducer from "../reducers/root.reducer";

//const middlewares = [logger]

const store: Store = createStore(rootReducer)//, applyMiddleware(...middlewares));

export default store;

export type State = ReturnType<typeof rootReducer>;

