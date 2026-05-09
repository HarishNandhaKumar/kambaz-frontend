"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form, Modal, Nav, Tab, Alert } from "react-bootstrap";
import * as client from "../../../../client";
import { FaTrash, FaPlus } from "react-icons/fa";

interface Question {
    _id?: string;
    title: string;
    question: string;
    type: "Multiple Choice" | "True/False" | "Fill in the Blank";
    points: number;
    quiz: string;
    choices?: { text: string; isCorrect: boolean }[];
    correctAnswer?: boolean;
    possibleAnswers?: (string | string[])[];
}

interface QuestionEditorProps {
    question: Question;
    isEditing: boolean;
    onEdit: () => void;
    onSave: (question: Question) => void;
    onCancel: () => void;
    onDelete: () => void;
}

export default function QuizEditor() {
    const { cid, qid } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("details");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
    
    const [quiz, setQuiz] = useState({
        title: "",
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
        dueDate: "",
        availableDate: "",
        untilDate: "",
        published: false
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizData, questionsData] = await Promise.all([
                    client.findQuizById(qid as string),
                    client.findQuestionsForQuiz(qid as string)
                ]);
                
                setQuiz({
                    ...quizData,
                    dueDate: quizData.dueDate ? new Date(quizData.dueDate).toISOString().slice(0, 16) : "",
                    availableDate: quizData.availableDate ? new Date(quizData.availableDate).toISOString().slice(0, 16) : "",
                    untilDate: quizData.untilDate ? new Date(quizData.untilDate).toISOString().slice(0, 16) : ""
                });
                
                setQuestions(questionsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [qid]);

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setQuiz(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSave = async () => {
        try {
            await client.updateQuiz(qid as string, {
                ...quiz,
                points: totalPoints,
                dueDate: quiz.dueDate ? new Date(quiz.dueDate).toISOString() : null,
                availableDate: quiz.availableDate ? new Date(quiz.availableDate).toISOString() : null,
                untilDate: quiz.untilDate ? new Date(quiz.untilDate).toISOString() : null
            });
            router.push(`/Courses/${cid}/Quizzes/${qid}`);
        } catch (error) {
            console.error("Error saving quiz:", error);
            alert("Failed to save quiz");
        }
    };

    const handleSaveAndPublish = async () => {
        try {
            await client.updateQuiz(qid as string, {
                ...quiz,
                points: totalPoints,
                published: true,
                dueDate: quiz.dueDate ? new Date(quiz.dueDate).toISOString() : null,
                availableDate: quiz.availableDate ? new Date(quiz.availableDate).toISOString() : null,
                untilDate: quiz.untilDate ? new Date(quiz.untilDate).toISOString() : null
            });
            router.push(`/Courses/${cid}/Quizzes`);
        } catch (error) {
            console.error("Error saving and publishing quiz:", error);
            alert("Failed to save and publish quiz");
        }
    };

    const handleCancel = () => {
        router.push(`/Courses/${cid}/Quizzes`);
    };

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            _id: `temp-${Date.now()}`,
            title: "",
            question: "",
            type: "Multiple Choice",
            points: 1,
            quiz: qid as string,
            choices: [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false }
            ]
        };
        setQuestions([...questions, newQuestion]);
        setEditingQuestionId(newQuestion._id!);
    };

    const handleDeleteClick = (question: Question) => {
        setQuestionToDelete(question);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (questionToDelete) {
            try {
                if (!questionToDelete._id?.startsWith('temp-')) {
                    await client.deleteQuestion(questionToDelete._id!);
                }
                setQuestions(questions.filter(q => q._id !== questionToDelete._id));
                setShowDeleteModal(false);
                setQuestionToDelete(null);
            } catch (error) {
                console.error("Error deleting question:", error);
                alert("Failed to delete question. Please try again.");
            }
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setQuestionToDelete(null);
    };

    if (loading) {
        return <div className="p-4">Loading quiz editor...</div>;
    }

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Points {totalPoints}</h4>
                <div className={quiz.published ? "text-success fw-bold" : "text-danger fw-bold"}>
                    {quiz.published ? "Published" : "Not Published"}
                </div>
            </div>

            {/* Tabs */}
            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "details")}>
                <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="details">Details</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="questions">Questions</Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    {/* Details Tab */}
                    <Tab.Pane eventKey="details">
                        <Form>
                            {/* Title */}
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={quiz.title}
                                    onChange={handleChange}
                                    placeholder="Unnamed Quiz"
                                    style={{ fontSize: "1.25rem", fontWeight: "500" }}
                                />
                            </Form.Group>

                            {/* Description */}
                            <Form.Group className="mb-4">
                                <Form.Label>Quiz Instructions:</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="description"
                                    value={quiz.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Enter quiz instructions..."
                                />
                            </Form.Group>

                            {/* Quiz Type */}
                            <Form.Group className="mb-3 row">
                                <Form.Label className="col-sm-3 col-form-label text-end">Quiz Type</Form.Label>
                                <div className="col-sm-9">
                                    <Form.Select name="quizType" value={quiz.quizType} onChange={handleChange}>
                                        <option>Graded Quiz</option>
                                        <option>Practice Quiz</option>
                                        <option>Graded Survey</option>
                                        <option>Ungraded Survey</option>
                                    </Form.Select>
                                </div>
                            </Form.Group>

                            {/* Assignment Group */}
                            <Form.Group className="mb-3 row">
                                <Form.Label className="col-sm-3 col-form-label text-end">Assignment Group</Form.Label>
                                <div className="col-sm-9">
                                    <Form.Select name="assignmentGroup" value={quiz.assignmentGroup} onChange={handleChange}>
                                        <option>Quizzes</option>
                                        <option>Exams</option>
                                        <option>Assignments</option>
                                        <option>Project</option>
                                    </Form.Select>
                                </div>
                            </Form.Group>

                            {/* Options Header */}
                            <h5 className="mt-4 mb-3">Options</h5>

                            {/* Shuffle Answers */}
                            <Form.Group className="mb-3 row">
                                <div className="col-sm-9 offset-sm-3">
                                    <Form.Check
                                        type="checkbox"
                                        name="shuffleAnswers"
                                        label="Shuffle Answers"
                                        checked={quiz.shuffleAnswers}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Form.Group>

                            {/* Time Limit */}
                            <Form.Group className="mb-3 row">
                                <Form.Label className="col-sm-3 col-form-label text-end">Time Limit</Form.Label>
                                <div className="col-sm-6">
                                    <div className="input-group">
                                        <Form.Control
                                            type="number"
                                            name="timeLimit"
                                            value={quiz.timeLimit}
                                            onChange={handleChange}
                                            min="0"
                                        />
                                        <span className="input-group-text">Minutes</span>
                                    </div>
                                </div>
                            </Form.Group>

                            {/* Multiple Attempts */}
                            <Form.Group className="mb-3 row">
                                <div className="col-sm-9 offset-sm-3">
                                    <Form.Check
                                        type="checkbox"
                                        name="multipleAttempts"
                                        label="Allow Multiple Attempts"
                                        checked={quiz.multipleAttempts}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Form.Group>

                            {/* How Many Attempts */}
                            {quiz.multipleAttempts && (
                                <Form.Group className="mb-3 row">
                                    <Form.Label className="col-sm-3 col-form-label text-end">How Many Attempts</Form.Label>
                                    <div className="col-sm-6">
                                        <Form.Control
                                            type="number"
                                            name="howManyAttempts"
                                            value={quiz.howManyAttempts}
                                            onChange={handleChange}
                                            min="1"
                                        />
                                    </div>
                                </Form.Group>
                            )}

                            {/* Show Correct Answers */}
                            <Form.Group className="mb-3 row">
                                <Form.Label className="col-sm-3 col-form-label text-end">Show Correct Answers</Form.Label>
                                <div className="col-sm-9">
                                    <Form.Select name="showCorrectAnswers" value={quiz.showCorrectAnswers} onChange={handleChange}>
                                        <option>Immediately</option>
                                        <option>After Due Date</option>
                                        <option>Never</option>
                                        <option>Always</option>
                                    </Form.Select>
                                </div>
                            </Form.Group>

                            {/* Access Code */}
                            <Form.Group className="mb-3 row">
                                <Form.Label className="col-sm-3 col-form-label text-end">Access Code</Form.Label>
                                <div className="col-sm-9">
                                    <Form.Control
                                        type="text"
                                        name="accessCode"
                                        value={quiz.accessCode}
                                        onChange={handleChange}
                                        placeholder="Optional access code"
                                    />
                                    <Form.Text className="text-muted">
                                        Leave blank if no access code is required
                                    </Form.Text>
                                </div>
                            </Form.Group>

                            {/* One Question at a Time */}
                            <Form.Group className="mb-3 row">
                                <div className="col-sm-9 offset-sm-3">
                                    <Form.Check
                                        type="checkbox"
                                        name="oneQuestionAtATime"
                                        label="One Question at a Time"
                                        checked={quiz.oneQuestionAtATime}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Form.Group>

                            {/* Webcam Required */}
                            <Form.Group className="mb-3 row">
                                <div className="col-sm-9 offset-sm-3">
                                    <Form.Check
                                        type="checkbox"
                                        name="webcamRequired"
                                        label="Webcam Required"
                                        checked={quiz.webcamRequired}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Form.Group>

                            {/* Lock Questions After Answering */}
                            <Form.Group className="mb-3 row">
                                <div className="col-sm-9 offset-sm-3">
                                    <Form.Check
                                        type="checkbox"
                                        name="lockQuestionsAfterAnswering"
                                        label="Lock Questions After Answering"
                                        checked={quiz.lockQuestionsAfterAnswering}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Form.Group>

                            {/* Assign Section */}
                            <h5 className="mt-4 mb-3">Assign</h5>

                            <div className="border rounded p-3 mb-3">
                                {/* Assign to */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Assign to</Form.Label>
                                    <div className="border rounded p-2 bg-light">
                                        Everyone
                                    </div>
                                </Form.Group>

                                {/* Due Date */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Due</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="dueDate"
                                        value={quiz.dueDate}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                {/* Available from and Until */}
                                <div className="row">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Available from</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                name="availableDate"
                                                value={quiz.availableDate}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Until</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                name="untilDate"
                                                value={quiz.untilDate}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <Button variant="secondary" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button variant="danger" onClick={handleSave}>
                                    Save
                                </Button>
                                <Button variant="success" onClick={handleSaveAndPublish}>
                                    Save & Publish
                                </Button>
                            </div>
                        </Form>
                    </Tab.Pane>

                    {/* Questions Tab */}
                    <Tab.Pane eventKey="questions">
                        <div className="mb-3 text-center">
                            <Button variant="secondary" onClick={handleAddQuestion}>
                                + New Question
                            </Button>
                        </div>

                        <hr />

                        {questions.length === 0 ? (
                            <div className="text-center text-danger p-5">
                                <p>No questions yet. Click "+ New Question" to add one.</p>
                            </div>
                        ) : (
                            <div>
                                {questions.map((question) => (
                                    <QuestionEditor
                                        key={question._id}
                                        question={question}
                                        isEditing={editingQuestionId === question._id}
                                        onEdit={() => setEditingQuestionId(question._id!)}
                                        onSave={async (updatedQuestion: Question) => {
                                            try {
                                                if (updatedQuestion._id?.startsWith('temp-')) {
                                                    const { _id, ...questionData } = updatedQuestion;
                                                    const created = await client.createQuestion(qid as string, questionData);
                                                    setQuestions(questions.map(q => 
                                                        q._id === updatedQuestion._id ? created : q
                                                    ));
                                                } else {
                                                    await client.updateQuestion(updatedQuestion._id!, updatedQuestion);
                                                    setQuestions(questions.map(q => 
                                                        q._id === updatedQuestion._id ? updatedQuestion : q
                                                    ));
                                                }
                                                setEditingQuestionId(null);
                                            } catch (error) {
                                                console.error("Error saving question:", error);
                                                alert("Failed to save question");
                                            }
                                        }}
                                        onCancel={() => {
                                            if (question._id?.startsWith('temp-')) {
                                                setQuestions(questions.filter(q => q._id !== question._id));
                                            }
                                            setEditingQuestionId(null);
                                        }}
                                        onDelete={() => handleDeleteClick(question)}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="secondary" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleSave}>
                                Save
                            </Button>
                            <Button variant="success" onClick={handleSaveAndPublish}>
                                Save & Publish
                            </Button>
                        </div>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Question</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete <b>{questionToDelete?.title || "this question"}</b>?</p>
                    <p className="text-muted mb-0">This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteCancel}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>
                        Delete Question
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

// Question Editor Component with Multiple Blanks Support
function QuestionEditor({ question, isEditing, onEdit, onSave, onCancel, onDelete }: QuestionEditorProps) {
    const [editedQuestion, setEditedQuestion] = useState<Question>(question);

    useEffect(() => {
        setEditedQuestion(question);
    }, [question]);

    const handleSave = () => {
        const cleanedQuestion = { ...editedQuestion };
        // For Fill in the Blank, ensure possibleAnswers is properly formatted
        if (cleanedQuestion.type === "Fill in the Blank" && cleanedQuestion.possibleAnswers) {
            // Filter out empty answers and ensure proper array structure
            cleanedQuestion.possibleAnswers = cleanedQuestion.possibleAnswers.map(answerSet => {
                if (Array.isArray(answerSet)) {
                    // Filter out empty strings
                    const filtered = answerSet.filter(ans => ans && ans.trim() !== "");
                    return filtered.length > 0 ? filtered : [""];
                } else if (typeof answerSet === "string") {
                    // Convert single string to array
                    return answerSet.trim() !== "" ? [answerSet] : [""];
                }
                return [""];
            });
            
            // Remove blanks that have no valid answers
            const blankCount = countBlanks(cleanedQuestion.question);
            cleanedQuestion.possibleAnswers = cleanedQuestion.possibleAnswers.slice(0, blankCount);
        }
        
        onSave(cleanedQuestion);
    };

    // Count blanks in question text
    const countBlanks = (text: string) => {
        const matches = text.match(/\[blank\]/gi);
        return matches ? matches.length : 0;
    };

    // Synchronize possibleAnswers with number of blanks
    const syncAnswersWithBlanks = (questionText: string, currentAnswers: (string | string[])[] = []) => {
        const blankCount = countBlanks(questionText);
        
        if (blankCount === 0) {
            return [[""]];
        }
        
        const newAnswers: (string | string[])[] = [];
        for (let i = 0; i < blankCount; i++) {
            if (currentAnswers[i]) {
                newAnswers.push(currentAnswers[i]);
            } else {
                newAnswers.push([""]);
            }
        }
        
        return newAnswers;
    };

    if (!isEditing) {
        const blankCount = editedQuestion.type === "Fill in the Blank" 
            ? countBlanks(editedQuestion.question) 
            : 0;

        return (
            <div className="border rounded p-3 mb-3 bg-light" onClick={onEdit} style={{ cursor: "pointer" }}>
                <div className="d-flex justify-content-between">
                    <div>
                        <strong>{editedQuestion.title || "Untitled Question"}</strong>
                        <span className="ms-2 text-muted">({editedQuestion.type})</span>
                        {blankCount > 0 && (
                            <span className="ms-2 badge bg-info">{blankCount} blank{blankCount > 1 ? 's' : ''}</span>
                        )}
                        <span className="ms-2 badge bg-primary">{editedQuestion.points} pts</span>
                    </div>
                    <FaTrash className="text-danger" onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                        style={{ cursor: "pointer", transition: "transform 0.2s ease-in-out" }} 
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.3)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded p-4 mb-3">
            <div className="row mb-3">
                <div className="col-md-6">
                    <Form.Control
                        type="text"
                        placeholder="Question Title"
                        value={editedQuestion.title}
                        onChange={(e) => setEditedQuestion({ ...editedQuestion, title: e.target.value })}
                    />
                </div>
                <div className="col-md-3">
                    <Form.Select
                        value={editedQuestion.type}
                        onChange={(e) => {
                            const newType = e.target.value as Question["type"];
                            const updates: Partial<Question> = { type: newType };
                            
                            if (newType === "Multiple Choice") {
                                updates.choices = [
                                    { text: "", isCorrect: false },
                                    { text: "", isCorrect: false }
                                ];
                                updates.correctAnswer = undefined;
                                updates.possibleAnswers = undefined;
                            } else if (newType === "True/False") {
                                updates.correctAnswer = true;
                                updates.choices = undefined;
                                updates.possibleAnswers = undefined;
                            } else if (newType === "Fill in the Blank") {
                                updates.possibleAnswers = [[""]];
                                updates.choices = undefined;
                                updates.correctAnswer = undefined;
                            }
                            
                            setEditedQuestion({ ...editedQuestion, ...updates });
                        }}
                    >
                        <option>Multiple Choice</option>
                        <option>True/False</option>
                        <option>Fill in the Blank</option>
                    </Form.Select>
                </div>
                <div className="col-md-3">
                    <div className="input-group">
                        <span className="input-group-text">pts:</span>
                        <Form.Control
                            type="number"
                            value={editedQuestion.points}
                            onChange={(e) => setEditedQuestion({ ...editedQuestion, points: parseInt(e.target.value) || 0 })}
                            min="0"
                        />
                    </div>
                </div>
            </div>

            <Form.Group className="mb-3">
                <Form.Label>Question:</Form.Label>
                {editedQuestion.type === "Fill in the Blank" && (
                    <Alert variant="info" className="mb-2">
                        <small>
                            <strong>Tip:</strong> Use <code>[blank]</code> to mark where students should fill in answers.
                            <br />
                            Example: "The capital of [blank] is [blank]."
                        </small>
                    </Alert>
                )}
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={editedQuestion.question}
                    onChange={(e) => {
                        const newQuestion = e.target.value;
                        const updates: Partial<Question> = { question: newQuestion };
                        
                        if (editedQuestion.type === "Fill in the Blank") {
                            updates.possibleAnswers = syncAnswersWithBlanks(
                                newQuestion,
                                editedQuestion.possibleAnswers
                            );
                        }
                        
                        setEditedQuestion({ ...editedQuestion, ...updates });
                    }}
                    placeholder="Enter your question text..."
                />
                {editedQuestion.type === "Fill in the Blank" && (
                    <Form.Text className="text-muted">
                        Detected {countBlanks(editedQuestion.question)} blank{countBlanks(editedQuestion.question) !== 1 ? 's' : ''}
                    </Form.Text>
                )}
            </Form.Group>

            {editedQuestion.type === "Multiple Choice" && editedQuestion.choices && editedQuestion.choices.length > 0 && (
                <div>
                    <Form.Label>Answers:</Form.Label>
                    {editedQuestion.choices.map((choice, index) => (
                        <div key={index} className="mb-2 d-flex align-items-center">
                            <Form.Check
                                type="radio"
                                name={`correct-${editedQuestion._id}`}
                                checked={choice.isCorrect}
                                onChange={() => {
                                    const newChoices = editedQuestion.choices!.map((c, i) => ({
                                        ...c,
                                        isCorrect: i === index
                                    }));
                                    setEditedQuestion({ ...editedQuestion, choices: newChoices });
                                }}
                                label=""
                                className="me-2"
                            />
                            <Form.Control
                                type="text"
                                value={choice.text}
                                onChange={(e) => {
                                    const newChoices = [...editedQuestion.choices!];
                                    newChoices[index].text = e.target.value;
                                    setEditedQuestion({ ...editedQuestion, choices: newChoices });
                                }}
                                placeholder={`Possible Answer ${index + 1}`}
                            />
                            {editedQuestion.choices!.length > 2 && (
                                <Button
                                    variant="link"
                                    className="text-danger"
                                    onClick={() => {
                                        const newChoices = editedQuestion.choices!.filter((_, i) => i !== index);
                                        setEditedQuestion({ ...editedQuestion, choices: newChoices });
                                    }}
                                >
                                    <FaTrash />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        variant="link"
                        className="text-danger"
                        onClick={() => {
                            setEditedQuestion({
                                ...editedQuestion,
                                choices: [...(editedQuestion.choices || []), { text: "", isCorrect: false }]
                            });
                        }}
                    >
                        + Add Another Answer
                    </Button>
                </div>
            )}

            {editedQuestion.type === "True/False" && (
                <div>
                    <Form.Label>Answers:</Form.Label>
                    <div className="mb-2">
                        <Form.Check
                            type="radio"
                            label="True"
                            checked={editedQuestion.correctAnswer === true}
                            onChange={() => setEditedQuestion({ ...editedQuestion, correctAnswer: true })}
                        />
                    </div>
                    <div className="mb-2">
                        <Form.Check
                            type="radio"
                            label="False"
                            checked={editedQuestion.correctAnswer === false}
                            onChange={() => setEditedQuestion({ ...editedQuestion, correctAnswer: false })}
                        />
                    </div>
                </div>
            )}

            {editedQuestion.type === "Fill in the Blank" && editedQuestion.possibleAnswers && (
                <div>
                    <Form.Label>Correct Answers for Each Blank:</Form.Label>
                    {editedQuestion.possibleAnswers.map((answerSet, blankIndex) => {
                        const answers = Array.isArray(answerSet) ? answerSet : [answerSet];
                        
                        return (
                            <div key={blankIndex} className="mb-3 p-3 border rounded bg-light">
                                <h6 className="mb-2">Blank {blankIndex + 1}</h6>
                                {answers.map((answer, answerIndex) => (
                                    <div key={answerIndex} className="mb-2 d-flex align-items-center">
                                        <Form.Control
                                            type="text"
                                            value={answer}
                                            onChange={(e) => {
                                                const newAnswers = [...editedQuestion.possibleAnswers!];
                                                const currentAnswerSet = Array.isArray(newAnswers[blankIndex]) 
                                                    ? [...(newAnswers[blankIndex] as string[])]
                                                    : [newAnswers[blankIndex] as string];
                                                currentAnswerSet[answerIndex] = e.target.value;
                                                newAnswers[blankIndex] = currentAnswerSet;
                                                setEditedQuestion({ ...editedQuestion, possibleAnswers: newAnswers });
                                            }}
                                            placeholder={`Correct answer ${answerIndex + 1}`}
                                        />
                                        {answers.length > 1 && (
                                            <Button
                                                variant="link"
                                                className="text-danger"
                                                onClick={() => {
                                                    const newAnswers = [...editedQuestion.possibleAnswers!];
                                                    const currentAnswerSet = Array.isArray(newAnswers[blankIndex])
                                                        ? (newAnswers[blankIndex] as string[]).filter((_, i) => i !== answerIndex)
                                                        : [];
                                                    newAnswers[blankIndex] = currentAnswerSet.length > 0 ? currentAnswerSet : [""];
                                                    setEditedQuestion({ ...editedQuestion, possibleAnswers: newAnswers });
                                                }}
                                            >
                                                <FaTrash />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    variant="link"
                                    className="text-primary"
                                    size="sm"
                                    onClick={() => {
                                        const newAnswers = [...editedQuestion.possibleAnswers!];
                                        const currentAnswerSet = Array.isArray(newAnswers[blankIndex])
                                            ? [...(newAnswers[blankIndex] as string[])]
                                            : [newAnswers[blankIndex] as string];
                                        currentAnswerSet.push("");
                                        newAnswers[blankIndex] = currentAnswerSet;
                                        setEditedQuestion({ ...editedQuestion, possibleAnswers: newAnswers });
                                    }}
                                >
                                    <FaPlus className="me-1" /> Add Alternative Answer
                                </Button>
                                <Form.Text className="d-block text-muted mt-1">
                                    <small>Add multiple acceptable answers (case-insensitive)</small>
                                </Form.Text>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="d-flex justify-content-start gap-2 mt-3">
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleSave}>
                    Update Question
                </Button>
            </div>
        </div>
    );
}