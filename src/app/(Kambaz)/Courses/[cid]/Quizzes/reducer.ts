import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Quiz {
    _id: string;
    title: string;
    description: string;
    course: string;
    quizType: "Graded Quiz" | "Practice Quiz" | "Graded Survey" | "Ungraded Survey";
    points: number;
    assignmentGroup: "Quizzes" | "Exams" | "Assignments" | "Project";
    shuffleAnswers: boolean;
    timeLimit: number;
    multipleAttempts: boolean;
    howManyAttempts: number;
    showCorrectAnswers: "Immediately" | "After Due Date" | "Never" | "Always";
    accessCode: string;
    oneQuestionAtATime: boolean;
    webcamRequired: boolean;
    lockQuestionsAfterAnswering: boolean;
    dueDate?: string | null;
    availableDate?: string | null;
    untilDate?: string | null;
    published: boolean;
    questions: any[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

interface QuizzesState {
    quizzes: Quiz[];
}

const initialState: QuizzesState = {
    quizzes: []
};

const quizzesSlice = createSlice({
    name: "quizzes",
    initialState,
    reducers: {
        setQuizzes: (state, action: PayloadAction<Quiz[]>) => {
            state.quizzes = action.payload;
        },
        addQuiz: (state, action: PayloadAction<Quiz>) => {
            state.quizzes.push(action.payload);
        },
        updateQuiz: (state, action: PayloadAction<Quiz>) => {
            const index = state.quizzes.findIndex(q => q._id === action.payload._id);
            if (index !== -1) {
                state.quizzes[index] = action.payload;
            }
        },
        deleteQuiz: (state, action: PayloadAction<string>) => {
            state.quizzes = state.quizzes.filter(q => q._id !== action.payload);
        }
    }
});

export const { setQuizzes, addQuiz, updateQuiz, deleteQuiz } = quizzesSlice.actions;
export default quizzesSlice.reducer;