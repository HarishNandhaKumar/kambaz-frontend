"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import * as client from "../../../../client";
import { FaPencilAlt } from "react-icons/fa";

interface Answer {
    questionId: string;
    answer: string | boolean | string[];
}

export default function QuizPreview() {
    const { cid, qid } = useParams();
    const router = useRouter();
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizData, questionsData] = await Promise.all([
                    client.findQuizById(qid as string),
                    client.findQuestionsForQuiz(qid as string)
                ]);
                setQuiz(quizData);
                setQuestions(questionsData);
            } catch (error) {
                console.error("Error fetching quiz:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [qid]);

    const handleAnswerChange = (questionId: string, answer: string | boolean | string[]) => {
        setAnswers(prev => {
            const existing = prev.find(a => a.questionId === questionId);
            if (existing) {
                return prev.map(a => a.questionId === questionId ? { questionId, answer } : a);
            }
            return [...prev, { questionId, answer }];
        });
    };

    const getAnswerForQuestion = (questionId: string) => {
        return answers.find(a => a.questionId === questionId)?.answer;
    };

    const calculateScore = () => {
        let totalPoints = 0;

        questions.forEach(question => {
            const userAnswer = getAnswerForQuestion(question._id);
            let isCorrect = false;

            if (question.type === "Multiple Choice") {
                const correctChoice = question.choices?.find((c: any) => c.isCorrect);
                isCorrect = userAnswer === correctChoice?.text;
            } else if (question.type === "True/False") {
                isCorrect = userAnswer === question.correctAnswer;
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
                        isCorrect = allCorrect && userAnswer.length === question.possibleAnswers.length;
                    }
                }
            }

            if (isCorrect) {
                totalPoints += question.points;
            }
        });

        return totalPoints;
    };

    const handleSubmit = () => {
        const finalScore = calculateScore();
        setScore(finalScore);
        setSubmitted(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleKeepEditing = () => {
        router.push(`/Courses/${cid}/Quizzes/${qid}/edit`);
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

    if (loading) {
        return <div className="p-4">Loading quiz preview...</div>;
    }

    if (!quiz) {
        return <div className="p-4">Quiz not found</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const showOneAtATime = quiz.oneQuestionAtATime;

    return (
        <div className="container-fluid p-4">
            {/* Dotted border container */}
            <div className="border border-secondary" style={{ borderStyle: 'dashed', borderRadius: '8px', padding: '24px' }}>
                <h3 className="mb-3">{quiz.title}</h3>

                {/* Preview Alert */}
                <Alert variant="danger" className="mb-3">
                    ⓘ This is a preview of the published version of the quiz
                </Alert>

                {/* Started time */}
                <p className="text-muted mb-3">
                    Started: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>

                {/* Quiz Instructions */}
                {quiz.description && (
                    <div className="mb-4">
                        <h4>Quiz Instructions</h4>
                        <p>{quiz.description}</p>
                    </div>
                )}

                {/* Questions Display */}
                {showOneAtATime ? (
                    // One question at a time
                    currentQuestion && (
                        <QuestionDisplay
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                            userAnswer={getAnswerForQuestion(currentQuestion._id)}
                            onAnswerChange={handleAnswerChange}
                            showResult={submitted}
                            isCorrect={submitted ? isQuestionCorrect(currentQuestion) : false}
                        />
                    )
                ) : (
                    // All questions at once
                    questions.map((question, index) => (
                        <QuestionDisplay
                            key={question._id}
                            question={question}
                            questionNumber={index + 1}
                            userAnswer={getAnswerForQuestion(question._id)}
                            onAnswerChange={handleAnswerChange}
                            showResult={submitted}
                            isCorrect={submitted ? isQuestionCorrect(question) : false}
                        />
                    ))
                )}

                {/* Navigation Buttons */}
                {!submitted && (
                    <div className="d-flex justify-content-end mt-4">
                        {showOneAtATime && (
                            <>
                                <Button variant="secondary" className="me-2"
                                    onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                                    Previous
                                </Button>
                                {currentQuestionIndex < questions.length - 1 ? (
                                    <Button variant="primary" onClick={handleNext}>
                                        Next
                                    </Button>
                                ) : (
                                    <Button variant="danger" onClick={handleSubmit}>
                                        Submit Quiz
                                    </Button>
                                )}
                            </>
                        )}
                        {!showOneAtATime && (
                            <Button variant="danger" onClick={handleSubmit}>
                                Submit Quiz
                            </Button>
                        )}
                    </div>
                )}

                {/* Score Display */}
                {submitted && (
                    <div className="mt-4">
                        <Alert variant="success">
                            <h5>Quiz Submitted!</h5>
                            <p className="mb-0">Your Score: {score} / {quiz.points} ({((score / quiz.points) * 100).toFixed(1)}%)</p>
                        </Alert>
                    </div>
                )}
            </div>

            {/* Keep Editing Button */}
            <div className="mt-3">
                <Button variant="danger" onClick={handleKeepEditing}>
                    <FaPencilAlt className="me-2" />
                    Keep Editing This Quiz
                </Button>
            </div>

            {/* Questions List */}
            {showOneAtATime && (
                <div className="mt-4">
                    <h5>Questions</h5>
                    <ul className="list-unstyled">
                        {questions.map((q, index) => (
                            <li 
                                key={q._id} 
                                className={`mb-1 ${index === currentQuestionIndex ? 'text-danger fw-bold' : 'text-muted'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setCurrentQuestionIndex(index)}
                            >
                                {submitted && (
                                    <span className="me-2">
                                        {isQuestionCorrect(q) ? '✓' : '✗'}
                                    </span>
                                )}
                                Question {index + 1}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Question Display Component with Multiple Blanks Support
function QuestionDisplay({ 
    question, 
    questionNumber, 
    userAnswer, 
    onAnswerChange, 
    showResult, 
    isCorrect 
}: {
    question: any;
    questionNumber: number;
    userAnswer: any;
    onAnswerChange: (questionId: string, answer: any) => void;
    showResult: boolean;
    isCorrect: boolean;
}) {
    // Parse question text to find blanks marked with [blank]
    const parseQuestionText = (text: string) => {
        const parts = text.split(/(\[blank\])/gi);
        return parts;
    };

    const handleBlankChange = (blankIndex: number, value: string) => {
        const currentAnswers = Array.isArray(userAnswer) ? [...userAnswer] : [];
        currentAnswers[blankIndex] = value;
        onAnswerChange(question._id, currentAnswers);
    };

    const getBlankValue = (blankIndex: number) => {
        if (Array.isArray(userAnswer)) {
            return userAnswer[blankIndex] || "";
        }
        return "";
    };

    return (
        <div className="border rounded p-3 mb-4" style={{ backgroundColor: showResult ? (isCorrect ? '#d4edda' : '#f8d7da') : 'white' }}>
            <div className="d-flex justify-content-between mb-3">
                <h5>Question {questionNumber}</h5>
                <span className="badge bg-primary">{question.points} pts</span>
            </div>

            {/* Multiple Choice */}
            {question.type === "Multiple Choice" && question.choices && (
                <>
                    <div className="mb-3">{question.question}</div>
                    <div>
                        {question.choices.map((choice: any, index: number) => (
                            <div key={index} className="mb-2">
                                <Form.Check
                                    type="radio"
                                    id={`q-${question._id}-choice-${index}`}
                                    name={`question-${question._id}`}
                                    label={choice.text}
                                    checked={userAnswer === choice.text}
                                    onChange={() => onAnswerChange(question._id, choice.text)}
                                    disabled={showResult}
                                />
                                {showResult && choice.isCorrect && (
                                    <span className="text-success ms-3">✓ Correct Answer</span>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* True/False */}
            {question.type === "True/False" && (
                <>
                    <div className="mb-3">{question.question}</div>
                    <div>
                        <div className="mb-2">
                            <Form.Check
                                type="radio"
                                id={`q-${question._id}-true`}
                                name={`question-${question._id}`}
                                label="True"
                                checked={userAnswer === true}
                                onChange={() => onAnswerChange(question._id, true)}
                                disabled={showResult}
                            />
                            {showResult && question.correctAnswer === true && (
                                <span className="text-success ms-3">✓ Correct Answer</span>
                            )}
                        </div>
                        <div className="mb-2">
                            <Form.Check
                                type="radio"
                                id={`q-${question._id}-false`}
                                name={`question-${question._id}`}
                                label="False"
                                checked={userAnswer === false}
                                onChange={() => onAnswerChange(question._id, false)}
                                disabled={showResult}
                            />
                            {showResult && question.correctAnswer === false && (
                                <span className="text-success ms-3">✓ Correct Answer</span>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Fill in the Blank - Multiple Blanks Support */}
            {question.type === "Fill in the Blank" && (
                <div>
                    {(() => {
                        const parts = parseQuestionText(question.question);
                        let blankIndex = 0;
                        
                        return (
                            <div className="mb-3">
                                {parts.map((part, index) => {
                                    if (part.toLowerCase() === '[blank]') {
                                        const currentBlankIndex = blankIndex;
                                        blankIndex++;
                                        return (
                                            <Form.Control
                                                key={index}
                                                type="text"
                                                value={getBlankValue(currentBlankIndex)}
                                                onChange={(e) => handleBlankChange(currentBlankIndex, e.target.value)}
                                                placeholder={`Blank ${currentBlankIndex + 1}`}
                                                disabled={showResult}
                                                style={{ 
                                                    display: 'inline-block', 
                                                    width: '200px',
                                                    marginLeft: '5px',
                                                    marginRight: '5px'
                                                }}
                                            />
                                        );
                                    }
                                    return <span key={index}>{part}</span>;
                                })}
                            </div>
                        );
                    })()}
                    {showResult && question.possibleAnswers && (
                        <div className="mt-2 text-muted">
                            <small>
                                Correct answers: {
                                    Array.isArray(question.possibleAnswers[0]) 
                                        ? question.possibleAnswers.map((answers: any) => 
                                            Array.isArray(answers) ? answers.join(" or ") : answers
                                          ).join(", ")
                                        : question.possibleAnswers?.join(", ")
                                }
                            </small>
                        </div>
                    )}
                </div>
            )}

            {/* Show if answer is correct/incorrect */}
            {showResult && (
                <div className="mt-3">
                    {isCorrect ? (
                        <span className="text-success fw-bold">✓ Correct</span>
                    ) : (
                        <span className="text-danger fw-bold">✗ Incorrect</span>
                    )}
                </div>
            )}
        </div>
    );
}