import { createStore } from "redux";
import rootReducer from "../reducers/reduxReducers";

const store = createStore(rootReducer);

export default store;