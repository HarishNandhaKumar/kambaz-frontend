import axios from "axios";
const axiosWithCredentials = axios.create({ withCredentials: true });
const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;
const COURSES_API = `${HTTP_SERVER}/api/courses`;
const USERS_API = `${HTTP_SERVER}/api/users`;
const MODULES_API = `${HTTP_SERVER}/api/modules`;
const ASSIGNMENTS_API = `${HTTP_SERVER}/api/assignments`;


export const fetchAllCourses = async () => {
    const { data } = await axiosWithCredentials.get(COURSES_API);
    return data;
};

export const findMyCourses = async () => {
    const { data } = await axiosWithCredentials.get(`${USERS_API}/current/courses`);
    return data;
};

export const createCourse = async (course: any) => {
    const { data } = await axiosWithCredentials.post(`${USERS_API}/current/courses`, course);
    return data;
};

export const deleteCourse = async (id: string) => {
    const { data } = await axiosWithCredentials.delete(`${COURSES_API}/${id}`);
    return data;
};

export const updateCourse = async (course: any) => {
    const { data } = await axiosWithCredentials.put(`${COURSES_API}/${course._id}`, course);
    return data;
};

export const enrollInCourse = async (userId: string, courseId: string) => {
    const { data } = await axiosWithCredentials.post(`${USERS_API}/${userId}/courses/${courseId}`);
    return data;
};

export const unenrollFromCourse = async (userId: string, courseId: string) => {
    await axiosWithCredentials.delete(`${USERS_API}/${userId}/courses/${courseId}`);
};

export const findEnrollmentsForUser = async (userId: string) => {
    const { data } = await axiosWithCredentials.get(`${USERS_API}/${userId}/enrollments`);
    return data;
};

export const findModulesForCourse = async (courseId: string) => {
    const response = await axiosWithCredentials.get(`${COURSES_API}/${courseId}/modules`);
    return response.data;
};

export const createModuleForCourse = async (courseId: string, module: any) => {
    const response = await axiosWithCredentials.post(`${COURSES_API}/${courseId}/modules`, module);
    return response.data;
};

export const deleteModule = async (moduleId: string) => {
    const response = await axiosWithCredentials.delete(`${MODULES_API}/${moduleId}`);
    return response.data;
};

export const updateModule = async (module: any) => {
    const { data } = await axiosWithCredentials.put(`${MODULES_API}/${module._id}`, module);
    return data;
};

export const findAssigmentsForCourse = async (courseId: string) => {
    const response = await axiosWithCredentials.get(`${COURSES_API}/${courseId}/assignments`);
    return response.data;
};

export const createAssignmentForCourse = async (courseId: string, assignment: any) => {
    const response = await axiosWithCredentials.post(`${COURSES_API}/${courseId}/assignments`, assignment);
    return response.data;
};

export const updateAssignment = async (assignment: any) => {
    const response = await axiosWithCredentials.put(`${ASSIGNMENTS_API}/${assignment._id}`,assignment);
    return response.data;
};

export const deleteAssignment = async (assignmentId: string) => {
    const response = await axiosWithCredentials.delete(`${ASSIGNMENTS_API}/${assignmentId}`);
    return response.data;
};

export const findUsersForCourse = async (courseId: string) => {
    const { data } = await axiosWithCredentials.get(`${HTTP_SERVER}/api/courses/${courseId}/users`);
    return data;
};

// quiz project 

export const findQuizzesForCourse = async (courseId: string) => {
    const response = await axiosWithCredentials.get(`${COURSES_API}/${courseId}/quizzes`);
    return response.data;
};

export const findQuizById = async (quizId: string) => {
    const response = await axiosWithCredentials.get(`${HTTP_SERVER}/api/quizzes/${quizId}`);
    return response.data;
};

export const deleteQuiz = async (quizId: string) => {
    const response = await axiosWithCredentials.delete(`${HTTP_SERVER}/api/quizzes/${quizId}`);
    return response.data;
};

export const updateQuiz = async (quizId: string, quiz: any) => {
    const response = await axiosWithCredentials.put(`${HTTP_SERVER}/api/quizzes/${quizId}`, quiz);
    return response.data;
};

export const findQuestionsForQuiz = async (quizId: string) => {
    const response = await axiosWithCredentials.get(`${HTTP_SERVER}/api/quizzes/${quizId}/questions`);
    return response.data;
};

export const createQuiz = async (courseId: string, quiz: any) => {
    const response = await axiosWithCredentials.post(`${COURSES_API}/${courseId}/quizzes`, quiz);
    return response.data;
};

// Questions

export const findQuestionById = async (questionId: string) => {
    const response = await axiosWithCredentials.get(`${HTTP_SERVER}/api/questions/${questionId}`);
    return response.data;
};

export const createQuestion = async (quizId: string, question: any) => {
    const response = await axiosWithCredentials.post(`${HTTP_SERVER}/api/quizzes/${quizId}/questions`, question);
    return response.data;
};

export const updateQuestion = async (questionId: string, question: any) => {
    const response = await axiosWithCredentials.put(`${HTTP_SERVER}/api/questions/${questionId}`, question);
    return response.data;
};

export const deleteQuestion = async (questionId: string) => {
    const response = await axiosWithCredentials.delete(`${HTTP_SERVER}/api/questions/${questionId}`);
    return response.data;
};

// Quiz Attempt functions

export const getAttemptCount = async (quizId: string) => {
    const response = await axiosWithCredentials.get(`${HTTP_SERVER}/api/quizzes/${quizId}/attempt-count`);
    return response.data;
};

export const getLastAttempt = async (quizId: string) => {
    const response = await axiosWithCredentials.get(`${HTTP_SERVER}/api/quizzes/${quizId}/last-attempt`);
    return response.data;
};

export const submitQuizAttempt = async (quizId: string, attemptData: any) => {
    const response = await axiosWithCredentials.post(`${HTTP_SERVER}/api/quizzes/${quizId}/attempts`, attemptData);
    return response.data;
};

export const getQuizAttempts = async (quizId: string) => {
    const response = await axiosWithCredentials.get(`${HTTP_SERVER}/api/quizzes/${quizId}/attempts`);
    return response.data;
};