"use client";
import { FaPlus } from "react-icons/fa6";
import { IoEllipsisVertical } from "react-icons/io5";
import { useParams, useRouter } from "next/navigation";
import * as client from "../../client";
import { RootState } from "../../../store";
import { useSelector } from "react-redux";

export default function QuizzesButtons() {
    const { cid } = useParams();
    const router = useRouter();

    const { currentUser } = useSelector((state: RootState) => state.accountReducer);
    const isFaculty = currentUser?.role === "FACULTY";

    const handleAddQuiz = async () => {
        if (!isFaculty) return;

        try {
            const newQuiz = {
                title: "Unnamed Quiz",
                description: "",
                quizType: "Graded Quiz",
                points: 0,
                assignmentGroup: "Quizzes",
                shuffleAnswers: true,
                timeLimit: 20,
                multipleAttempts: false,
                howManyAttempts: 1,
                showCorrectAnswers: "Immediately",
                accessCode: "",
                oneQuestionAtATime: true,
                webcamRequired: false,
                lockQuestionsAfterAnswering: false,
                published: false,
                dueDate: null,
                availableDate: null,
                untilDate: null
            };

            const createdQuiz = await client.createQuiz(cid as string, newQuiz);
            
            // Navigate to quiz editor
            router.push(`/Courses/${cid}/Quizzes/${createdQuiz._id}/edit`);
        } catch (error) {
            console.error("Error creating quiz:", error);
            alert("Failed to create quiz");
        }
    };

    return (
        <div id="wd-quizzes-controls" className="text-nowrap d-flex justify-content-end align-items-center gap-2">
            {isFaculty && (
                <>
                    <button className="btn btn-lg btn-danger me-1" onClick={handleAddQuiz}>
                        <FaPlus className="me-2" />
                        Quiz
                    </button>
                    <button className="btn btn-lg btn-secondary">
                        <IoEllipsisVertical />
                    </button>
                </>
            )}
        </div>
    );
}