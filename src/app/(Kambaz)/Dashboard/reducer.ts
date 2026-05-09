import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { enrollments } from "../Database";

// Initial enrollments from database
const initialEnrollments = enrollments;

const initialState = {
    enrollments: initialEnrollments,
};

const enrollmentsSlice = createSlice({
    name: "enrollments",
    initialState,
    reducers: {
        
        setEnrollments: (state, action: PayloadAction<any[]>) => {
            state.enrollments = action.payload;
        },

        enrollCourse: (state, action: PayloadAction<{ userId: string; courseId: string }>) => {
            const { userId, courseId } = action.payload;
            // Check if already enrolled
            const alreadyEnrolled = state.enrollments.some(
                (e) => e.user === userId && e.course === courseId
            );
            
            if (!alreadyEnrolled) {
                const newEnrollment = {
                    _id: new Date().getTime().toString(),
                    user: userId,
                    course: courseId,
                };
                state.enrollments = [...state.enrollments, newEnrollment];
            }
        },
        
        unenrollCourse: (state, action: PayloadAction<{ userId: string; courseId: string }>) => {
            const { userId, courseId } = action.payload;
            state.enrollments = state.enrollments.filter(
                (e) => !(e.user === userId && e.course === courseId)
            );
        },

    },
});

export const { enrollCourse, unenrollCourse, setEnrollments } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;