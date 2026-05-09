"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import * as client from "../../../client";
import { Button, Alert } from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";

export default function QuizDetails() {
    const { cid, qid } = useParams();
    const router = useRouter();
    const { currentUser } = useSelector((state: RootState) => state.accountReducer);
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isFaculty = currentUser?.role === "FACULTY";
    const isStudent = currentUser?.role === "STUDENT";

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                console.log('Fetching quiz:', qid);
                const quizData = await client.findQuizById(qid as string);
                console.log('Quiz data received:', quizData);
                setQuiz(quizData);
            } catch (error: any) {
                console.error("Error fetching quiz:", error);
                setError(error.message || "Failed to load quiz");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [qid]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Not set";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes}${ampm}`;
    };

    const handleEdit = () => {
        router.push(`/Courses/${cid}/Quizzes/${qid}/edit`);
    };

    const handlePreview = () => {
        router.push(`/Courses/${cid}/Quizzes/${qid}/preview`);
    };

    const handleStartQuiz = () => {
        router.push(`/Courses/${cid}/Quizzes/${qid}/take`);
    };

    const isQuizAvailable = () => {
        if (!quiz.published) return false;
        
        const now = new Date();
        const availableDate = quiz.availableDate ? new Date(quiz.availableDate) : null;
        const untilDate = quiz.untilDate ? new Date(quiz.untilDate) : null;

        if (availableDate && now < availableDate) return false;
        if (untilDate && now > untilDate) return false;

        return true;
    };

    if (loading) {
        return <div className="p-4">Loading quiz details...</div>;
    }

    if (error || !quiz) {
        return (
            <div className="p-4">
                <div className="alert alert-danger">
                    {error || "Quiz not found"}
                </div>
                <Button onClick={() => router.push(`/Courses/${cid}/Quizzes`)}>
                    Back to Quizzes
                </Button>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            {/* Header with buttons - different for faculty and students */}
            <div className="d-flex justify-content-end align-items-center mb-3">
                {isFaculty && (
                    <>
                        <Button variant="warning" className="me-2" onClick={handlePreview}>
                            Preview
                        </Button>
                        <Button variant="danger" onClick={handleEdit}>
                            <FaPencilAlt className="me-2" />
                            Edit
                        </Button>
                    </>
                )}
                {isStudent && (
                    <>
                        {!quiz.published ? (
                            <Alert variant="warning" className="mb-0">
                                This quiz is not published yet. Please check back later.
                            </Alert>
                        ) : !isQuizAvailable() ? (
                            <Alert variant="info" className="mb-0">
                                This quiz is not currently available.
                            </Alert>
                        ) : (
                            <Button 
                                variant="danger" 
                                size="lg"
                                onClick={handleStartQuiz}
                            >
                                Start Quiz
                            </Button>
                        )}
                    </>
                )}
            </div>

            {/* Dotted border box */}
            <div className="border border-secondary" style={{ borderStyle: 'dashed', borderRadius: '8px', padding: '24px' }}>
                <h3 className="mb-4">{quiz.title}</h3>

                {/* Faculty View - Show all details */}
                {isFaculty && (
                    <>
                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>Quiz Type</b></div>
                            <div className="col-7">{quiz.quizType}</div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>Points</b></div>
                            <div className="col-7">{quiz.points}</div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>Assignment Group</b></div>
                            <div className="col-7">{quiz.assignmentGroup}</div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>Shuffle Answers</b></div>
                            <div className="col-7">{quiz.shuffleAnswers ? "Yes" : "No"}</div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>Time Limit</b></div>
                            <div className="col-7">{quiz.timeLimit} Minutes</div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>Multiple Attempts</b></div>
                            <div className="col-7">{quiz.multipleAttempts ? "Yes" : "No"}</div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>View Responses</b></div>
                            <div className="col-7">Always</div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>Show Correct Answers</b></div>
                            <div className="col-7">{quiz.showCorrectAnswers}</div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>One Question at a Time</b></div>
                            <div className="col-7">{quiz.oneQuestionAtATime ? "Yes" : "No"}</div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>Require Respondus LockDown Browser</b></div>
                            <div className="col-7">No</div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>Required to View Quiz Results</b></div>
                            <div className="col-7">No</div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-5 text-end"><b>Webcam Required</b></div>
                            <div className="col-7">{quiz.webcamRequired ? "Yes" : "No"}</div>
                        </div>

                        <div className="row mb-4">
                            <div className="col-5 text-end"><b>Lock Questions After Answering</b></div>
                            <div className="col-7">{quiz.lockQuestionsAfterAnswering ? "Yes" : "No"}</div>
                        </div>

                        {/* Horizontal line after details */}
                        <hr className="my-3" />
                    </>
                )}

                {/* Date Section - Show for both faculty and students */}
                <table className="table table-borderless mb-0">
                    <thead>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                            <th className="text-center pb-2"><b>Due</b></th>
                            <th className="text-center pb-2"><b>For</b></th>
                            <th className="text-center pb-2"><b>Available from</b></th>
                            <th className="text-center pb-2"><b>Until</b></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-center pt-2">
                                {formatDate(quiz.dueDate)} at {formatTime(quiz.dueDate)}
                            </td>
                            <td className="text-center pt-2">Everyone</td>
                            <td className="text-center pt-2">
                                {formatDate(quiz.availableDate)} at {formatTime(quiz.availableDate)}
                            </td>
                            <td className="text-center pt-2">
                                {formatDate(quiz.untilDate)} at {formatTime(quiz.untilDate)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
