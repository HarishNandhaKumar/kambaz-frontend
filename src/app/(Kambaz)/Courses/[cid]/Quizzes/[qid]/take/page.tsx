"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form, Alert, Modal } from "react-bootstrap";
import * as client from "../../../../client";
import { FaClock } from "react-icons/fa";

interface Answer {
    questionId: string;
    answer: string | boolean | string[];
}

export default function TakeQuiz() {
    const { cid, qid } = useParams();
    const router = useRouter();
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [attemptCount, setAttemptCount] = useState(0);
    const [canTakeQuiz, setCanTakeQuiz] = useState(true);
    const [loading, setLoading] = useState(true);
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);
    const [accessCodeInput, setAccessCodeInput] = useState("");
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizData, questionsData, attemptCountData] = await Promise.all([
                    client.findQuizById(qid as string),
                    client.findQuestionsForQuiz(qid as string),
                    client.getAttemptCount(qid as string)
                ]);
                
                setQuiz(quizData);
                setQuestions(questionsData);
                setAttemptCount(attemptCountData.count);
                
                // Set time remaining if there's a time limit
                if (quizData.timeLimit > 0) {
                    setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
                }
                
                // Check if student can take quiz
                if (!quizData.multipleAttempts && attemptCountData.count >= 1) {
                    setCanTakeQuiz(false);
                } else if (quizData.multipleAttempts && attemptCountData.count >= quizData.howManyAttempts) {
                    setCanTakeQuiz(false);
                }

                // Check if access code is required
                if (quizData.accessCode && attemptCountData.count === 0) {
                    setShowAccessCodeModal(true);
                }
                
                setStartTime(new Date());
            } catch (error) {
                console.error("Error fetching quiz:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [qid]);

    // Timer countdown effect
    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0 || showAccessCodeModal) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, showAccessCodeModal]);

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeRemaining === 0 && !showSubmitModal && !showTimeoutModal) {
            setShowTimeoutModal(true);
            // Auto-submit after 3 seconds
            setTimeout(() => {
                handleSubmitConfirm();
            }, 3000);
        }
    }, [timeRemaining]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (timeRemaining === null) return 'text-muted';
        if (timeRemaining < 60) return 'text-danger';
        if (timeRemaining < 300) return 'text-warning';
        return 'text-success';
    };

    const handleAnswerChange = (questionId: string, answer: string | boolean) => {
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

    const getUnansweredCount = () => {
        return questions.length - answers.length;
    };

    const handleSubmitClick = () => {
        setShowSubmitModal(true);
    };

    const handleSubmitConfirm = async () => {
        try {
            const score = calculateScore();
            
            await client.submitQuizAttempt(qid as string, {
                answers: answers,
                score: score,
                maxScore: quiz.points
            });

            setShowSubmitModal(false);
            setShowTimeoutModal(false);
            router.push(`/Courses/${cid}/Quizzes/${qid}/results`);
        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert("Failed to submit quiz");
        }
    };

    const handleSubmitCancel = () => {
        setShowSubmitModal(false);
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

    const validateAccessCode = () => {
        if (accessCodeInput === quiz.accessCode) {
            setShowAccessCodeModal(false);
        } else {
            alert("Incorrect access code");
        }
    };

    if (loading) {
        return <div className="p-4">Loading quiz...</div>;
    }

    if (!quiz) {
        return <div className="p-4">Quiz not found</div>;
    }

    if (!canTakeQuiz) {
        return (
            <div className="container-fluid p-4">
                <Alert variant="warning">
                    <h5>No More Attempts Available</h5>
                    <p>
                        You have used all {quiz.multipleAttempts ? quiz.howManyAttempts : 1} attempt(s) for this quiz.
                    </p>
                    <Button variant="primary" onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}/results`)}>
                        View Last Attempt
                    </Button>
                </Alert>
            </div>
        );
    }

    if (showAccessCodeModal) {
        return (
            <div className="container-fluid p-4">
                <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div className="card-body">
                        <h4 className="mb-3">Access Code Required</h4>
                        <p>This quiz requires an access code to begin.</p>
                        <Form.Group className="mb-3">
                            <Form.Label>Enter Access Code:</Form.Label>
                            <Form.Control
                                type="text"
                                value={accessCodeInput}
                                onChange={(e) => setAccessCodeInput(e.target.value)}
                                placeholder="Access Code"
                            />
                        </Form.Group>
                        <div className="d-flex gap-2">
                            <Button variant="secondary" onClick={() => router.push(`/Courses/${cid}/Quizzes`)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={validateAccessCode}>
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const showOneAtATime = quiz.oneQuestionAtATime;
    const unansweredCount = getUnansweredCount();

    return (
        <>
            <div className="container-fluid p-4">
                {/* Timer Display */}
                {timeRemaining !== null && (
                    <div className="mb-3">
                        <Alert variant={timeRemaining < 60 ? 'danger' : timeRemaining < 300 ? 'warning' : 'info'} className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <FaClock className="me-2" />
                                <span>Time Remaining:</span>
                            </div>
                            <h4 className={`mb-0 ${getTimerColor()}`}>
                                {formatTime(timeRemaining)}
                            </h4>
                        </Alert>
                    </div>
                )}

                <div className="border border-secondary" style={{ borderStyle: 'dashed', borderRadius: '8px', padding: '24px' }}>
                    <h3 className="mb-3">{quiz.title}</h3>

                    <p className="text-muted mb-3">
                        Started: {startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>

                    {quiz.description && (
                        <div className="mb-4">
                            <h5>Quiz Instructions</h5>
                            <p>{quiz.description}</p>
                        </div>
                    )}

                    {/* Questions Display */}
                    {showOneAtATime ? (
                        currentQuestion && (
                            <QuestionDisplay
                                question={currentQuestion}
                                questionNumber={currentQuestionIndex + 1}
                                userAnswer={getAnswerForQuestion(currentQuestion._id)}
                                onAnswerChange={handleAnswerChange}
                            />
                        )
                    ) : (
                        questions.map((question, index) => (
                            <QuestionDisplay
                                key={question._id}
                                question={question}
                                questionNumber={index + 1}
                                userAnswer={getAnswerForQuestion(question._id)}
                                onAnswerChange={handleAnswerChange}
                            />
                        ))
                    )}

                    {/* Navigation */}
                    <div className="d-flex justify-content-between mt-4">
                        <div>
                            {showOneAtATime && currentQuestionIndex > 0 && (
                                <Button variant="outline-secondary" onClick={handlePrevious}>
                                    Previous
                                </Button>
                            )}
                        </div>
                        <div>
                            {showOneAtATime && currentQuestionIndex < questions.length - 1 ? (
                                <Button variant="primary" onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <Button variant="danger" onClick={handleSubmitClick}>
                                    Submit Quiz
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="text-muted mt-3 text-end small">
                        Quiz saved at {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                </div>

                {/* Questions Navigation Sidebar */}
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
                                    ⓘ Question {index + 1}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Submit Confirmation Modal */}
            <Modal show={showSubmitModal} onHide={handleSubmitCancel} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Submit Quiz</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to submit this quiz?</p>
                    {unansweredCount > 0 && (
                        <Alert variant="warning" className="mb-3">
                            <strong>Warning:</strong> You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}.
                        </Alert>
                    )}
                    <div className="mb-2">
                        <strong>Quiz:</strong> {quiz.title}
                    </div>
                    <div className="mb-2">
                        <strong>Total Questions:</strong> {questions.length}
                    </div>
                    <div className="mb-2">
                        <strong>Answered:</strong> {answers.length} / {questions.length}
                    </div>
                    <div className="mb-3">
                        <strong>Attempt:</strong> {attemptCount + 1} of {quiz.multipleAttempts ? quiz.howManyAttempts : 1}
                    </div>
                    {timeRemaining !== null && (
                        <div className="mb-3">
                            <strong>Time Remaining:</strong> <span className={getTimerColor()}>{formatTime(timeRemaining)}</span>
                        </div>
                    )}
                    <p className="text-muted small mb-0">
                        Once submitted, you cannot change your answers.
                        {canTakeQuiz && quiz.multipleAttempts && attemptCount + 1 < quiz.howManyAttempts && 
                            " You will have more attempts available."}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleSubmitCancel}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleSubmitConfirm}>
                        Submit Quiz
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Timeout Modal */}
            <Modal show={showTimeoutModal} centered backdrop="static" keyboard={false}>
                <Modal.Header className="bg-danger text-white">
                    <Modal.Title>Time's Up!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="danger" className="mb-3">
                        <h5 className="mb-2">Quiz Time Expired</h5>
                        <p className="mb-0">
                            The time limit for this quiz has been reached.
                        </p>
                    </Alert>
                    <p>Your quiz will be submitted automatically in a moment...</p>
                    <div className="text-muted small">
                        <div><strong>Total Questions:</strong> {questions.length}</div>
                        <div><strong>Answered:</strong> {answers.length} / {questions.length}</div>
                        {unansweredCount > 0 && (
                            <div className="text-warning mt-2">
                                {unansweredCount} question{unansweredCount > 1 ? 's' : ''} left unanswered
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleSubmitConfirm}>
                        Submit Now
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

function QuestionDisplay({ 
    question, 
    questionNumber, 
    userAnswer, 
    onAnswerChange
}: {
    question: any;
    questionNumber: number;
    userAnswer: any;
    onAnswerChange: (questionId: string, answer: any) => void;
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
        <div className="border rounded p-3 mb-4 bg-white">
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
                                />
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
                            />
                        </div>
                        <div className="mb-2">
                            <Form.Check
                                type="radio"
                                id={`q-${question._id}-false`}
                                name={`question-${question._id}`}
                                label="False"
                                checked={userAnswer === false}
                                onChange={() => onAnswerChange(question._id, false)}
                            />
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
                    <div className="text-muted small">
                        <em>Fill in all blanks to complete the answer</em>
                    </div>
                </div>
            )}
        </div>
    );
}