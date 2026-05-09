"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Alert, Badge } from "react-bootstrap";
import * as client from "../../../../client";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function QuizResults() {
    const { cid, qid } = useParams();
    const router = useRouter();
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [lastAttempt, setLastAttempt] = useState<any>(null);
    const [attemptCount, setAttemptCount] = useState(0);
    const [canRetake, setCanRetake] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizData, questionsData, attemptData, countData] = await Promise.all([
                    client.findQuizById(qid as string),
                    client.findQuestionsForQuiz(qid as string),
                    client.getLastAttempt(qid as string),
                    client.getAttemptCount(qid as string)
                ]);
                
                setQuiz(quizData);
                setQuestions(questionsData);
                setLastAttempt(attemptData);
                setAttemptCount(countData.count);
                
                // Check if student can retake
                const canRetake = quizData.multipleAttempts && countData.count < quizData.howManyAttempts;
                setCanRetake(canRetake);
            } catch (error) {
                console.error("Error fetching results:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [qid]);

    const getAnswerForQuestion = (questionId: string) => {
        return lastAttempt?.answers?.find((a: any) => a.questionId === questionId)?.answer;
    };

    const isQuestionCorrect = (question: any) => {
        const userAnswer = getAnswerForQuestion(question._id);
        
        if (question.type === "Multiple Choice") {
            const correctChoice = question.choices?.find((c: any) => c.isCorrect);
            return userAnswer === correctChoice?.text;
        } else if (question.type === "True/False") {
            return userAnswer === question.correctAnswer;
        } else if (question.type === "Fill in the Blank") {
            // Handle multiple blanks
            if (Array.isArray(question.possibleAnswers) && question.possibleAnswers.length > 0) {
                if (Array.isArray(userAnswer)) {
                    // Multiple blanks: check each blank
                    const allCorrect = userAnswer.every((ans, index) => {
                        const correctAnswers = question.possibleAnswers[index];
                        if (Array.isArray(correctAnswers)) {
                            return correctAnswers.some((correct: string) => 
                                correct.toLowerCase().trim() === ans?.toLowerCase().trim()
                            );
                        }
                        return correctAnswers?.toLowerCase().trim() === ans?.toLowerCase().trim();
                    });
                    return allCorrect && userAnswer.length === question.possibleAnswers.length;
                }
            }
            return false;
        }
        return false;
    };

    const handleRetake = () => {
        router.push(`/Courses/${cid}/Quizzes/${qid}/take`);
    };

    if (loading) {
        return <div className="p-4">Loading results...</div>;
    }

    if (!lastAttempt) {
        return (
            <div className="p-4">
                <Alert variant="info">
                    <p>You haven't taken this quiz yet.</p>
                    <Button variant="primary" onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}/take`)}>
                        Take Quiz
                    </Button>
                </Alert>
            </div>
        );
    }

    const percentage = ((lastAttempt.score / lastAttempt.maxScore) * 100).toFixed(1);

    return (
        <div className="container-fluid p-4">
            <div className="border border-secondary" style={{ borderStyle: 'dashed', borderRadius: '8px', padding: '24px' }}>
                <h3 className="mb-3">{quiz.title}</h3>

                {/* Score Display */}
                <Alert variant={parseFloat(percentage) >= 70 ? 'success' : 'warning'} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="bg-white px-3 py-1 rounded border border-success">
                            <h5 className="mb-1">Quiz Completed</h5>
                            <p className="mb-0">
                                Score: {lastAttempt.score} / {lastAttempt.maxScore} ({percentage}%)
                            </p>
                            <p className="mb-0 small">
                                Submitted: {new Date(lastAttempt.submittedAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </p>
                            <p className="mb-0 small">
                                Attempt {lastAttempt.attemptNumber} of {quiz.multipleAttempts ? quiz.howManyAttempts : 1}
                            </p>
                        </div>
                        {canRetake && (
                            <Button variant="primary" onClick={handleRetake}>
                                Retake Quiz
                            </Button>
                        )}
                    </div>
                </Alert>

                {/* Questions with Answers */}
                <h5 className="mb-3">Your Answers</h5>
                
                {questions.map((question, index) => {
                    const userAnswer = getAnswerForQuestion(question._id);
                    const isCorrect = isQuestionCorrect(question);
                    
                    return (
                        <div 
                            key={question._id} 
                            className="border rounded p-3 mb-3"
                            style={{ 
                                backgroundColor: '#e6e6e6',
                                borderColor: isCorrect ? '#28a745' : '#dc3545'
                            }}
                        >
                            <div className="d-flex justify-content-between mb-2">
                                <h6>
                                    {isCorrect ? (
                                        <FaCheckCircle className="text-success me-2" />
                                    ) : (
                                        <FaTimesCircle className="text-danger me-2" />
                                    )}
                                    Question {index + 1}
                                    {isCorrect && <Badge bg="success" className="ms-2">Correct</Badge>}
                                    {!isCorrect && <Badge bg="danger" className="ms-2">Incorrect</Badge>}
                                </h6>
                                <span className="badge bg-primary">{question.points} pts</span>
                            </div>

                            <p className="mb-3">{question.question}</p>

                            {/* Show user's answer */}
                            <div className="mb-2">
                                <strong>Your Answer:</strong>{" "}
                                {question.type === "True/False" 
                                    ? (userAnswer === true ? "True" : userAnswer === false ? "False" : "Not answered")
                                    : Array.isArray(userAnswer) 
                                        ? userAnswer.join(", ") 
                                        : userAnswer || "Not answered"}
                            </div>

                            {/* Show correct answer if wrong */}
                            {!isCorrect && quiz.showCorrectAnswers !== "Never" && (
                                <div className="text-success">
                                    <span className="bg-white px-3 py-1 rounded border border-success"
                                        style={{ display: "inline-block" }}>
                                        <strong>Correct Answer:</strong>{" "}
                                        {question.type === "Multiple Choice" && 
                                            question.choices?.find((c: any) => c.isCorrect)?.text}
                                        {question.type === "True/False" && 
                                            (question.correctAnswer ? "True" : "False")}
                                        {question.type === "Fill in the Blank" && 
                                            (Array.isArray(question.possibleAnswers[0]) 
                                                ? question.possibleAnswers.map((answers: any) => 
                                                    Array.isArray(answers) ? answers.join(" or ") : answers
                                                  ).join(", ")
                                                : question.possibleAnswers?.join(", "))}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="mt-4">
                    <Button variant="secondary" onClick={() => router.push(`/Courses/${cid}/Quizzes`)}>
                        Back to Quizzes
                    </Button>
                </div>
            </div>
        </div>
    );
}