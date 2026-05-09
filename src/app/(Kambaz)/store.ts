import { configureStore } from "@reduxjs/toolkit";
import coursesReducer from "./Courses/reducer";
import modulesReducer from "./Courses/[cid]/Modules/reducer";
import accountReducer from "./Account/reducer";
import assignmentsReducer from "./Courses/[cid]/Assignments/reducer";
import enrollmentsReducer from "./Dashboard/reducer";
import quizzesReducer from "./Courses/[cid]/Quizzes/reducer";

const store = configureStore({
    reducer: { coursesReducer, modulesReducer, accountReducer, assignmentsReducer, enrollmentsReducer, quizzesReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;