"use client";
import QuizzesButtons from "./QuizzesButtons";
import { Button, ListGroup, ListGroupItem, Modal, Dropdown } from "react-bootstrap";
import { BsGripVertical } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus, FaSort } from "react-icons/fa6";
import { FaBan, FaCheckCircle } from "react-icons/fa";
import { IoEllipsisVertical } from "react-icons/io5";
import { NoteSymbol } from "./NoteSymbol"
import GreenCheckmark from "../Modules/GreenCheckmark";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { setQuizzes } from "./reducer";
import * as client from "../../client";

type SortOption = "name" | "dueDate" | "availableDate";

export default function Quizzes() {
    const { cid } = useParams();
    const router = useRouter();
    const { quizzes } = useSelector((state: RootState) => state.quizzesReducer);
    const { currentUser } = useSelector((state: RootState) => state.accountReducer);
    const dispatch = useDispatch();
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<{ id: string; title: string } | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("availableDate");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [questionCounts, setQuestionCounts] = useState<{ [key: string]: number }>({});

    const isFaculty = currentUser?.role === "FACULTY";

    const fetchQuizzes = async () => {
        const quizzes = await client.findQuizzesForCourse(cid as string);
        dispatch(setQuizzes(quizzes));

        const counts: { [key: string]: number } = {};
        await Promise.all(
            quizzes.map(async (quiz: any) => {
                try {
                    const questions = await client.findQuestionsForQuiz(quiz._id);
                    counts[quiz._id] = questions.length;
                } catch (error) {
                    console.error(`Error fetching questions for quiz ${quiz._id}:`, error);
                    counts[quiz._id] = 0;
                }
            })
        );
        setQuestionCounts(counts);
    };
    
    useEffect(() => {
        fetchQuizzes();
    }, [cid]);

    useEffect(() => {
        const handleFocus = () => {
            fetchQuizzes();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [cid]);

    // Sort quizzes based on selected option
    const getSortedQuizzes = () => {
        const quizzesCopy = [...quizzes];
        
        switch (sortBy) {
            case "name":
                return quizzesCopy.sort((a: any, b: any) => 
                    a.title.localeCompare(b.title)
                );
            
            case "dueDate":
                return quizzesCopy.sort((a: any, b: any) => {
                    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    return dateA - dateB;
                });
            
            case "availableDate":
            default:
                return quizzesCopy.sort((a: any, b: any) => {
                    const dateA = a.availableDate ? new Date(a.availableDate).getTime() : 0;
                    const dateB = b.availableDate ? new Date(b.availableDate).getTime() : 0;
                    return dateA - dateB;
                });
        }
    };

    const handleSortChange = (option: SortOption) => {
        setSortBy(option);
        setShowSortDropdown(false);
    };

    const getSortLabel = () => {
        switch (sortBy) {
            case "name":
                return "Name";
            case "dueDate":
                return "Due Date";
            case "availableDate":
                return "Available Date";
            default:
                return "Sort";
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
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
        const displayMinutes = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : '';
        return `${displayHours}${displayMinutes}${ampm}`;
    };

    const getAvailabilityStatus = (quiz: any) => {
        if (!quiz.published) return "Not available";
        
        const now = new Date();
        const availableDate = quiz.availableDate ? new Date(quiz.availableDate) : null;
        const untilDate = quiz.untilDate ? new Date(quiz.untilDate) : null;

        if (availableDate && now < availableDate) {
            return "Not available until";
        }

        if (untilDate && now > untilDate) {
            return "Closed";
        }

        return "Available";
    };

    const getNumberOfQuestions = (quizId: string) => {
        return questionCounts[quizId] || 0;
    };

    const handleEdit = (quizId: string) => {
        router.push(`/Courses/${cid}/Quizzes/${quizId}/edit`);
        setShowDropdown(null);
    };

    const handleDeleteClick = (quizId: string, quizTitle: string) => {
        setQuizToDelete({ id: quizId, title: quizTitle });
        setShowDeleteModal(true);
        setShowDropdown(null);
    };

    const handleDeleteConfirm = async () => {
        if (quizToDelete) {
            try {
                await client.deleteQuiz(quizToDelete.id);
                setShowDeleteModal(false);
                setQuizToDelete(null);
                fetchQuizzes();
            } catch (error) {
                console.error("Error deleting quiz:", error);
                alert("Failed to delete quiz. Please try again.");
            }
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setQuizToDelete(null);
    };

    const handlePublishToggle = async (quizId: string, currentPublished: boolean) => {
        try {
            await client.updateQuiz(quizId, { published: !currentPublished });
            fetchQuizzes();
        } catch (error) {
            console.error("Error toggling publish status:", error);
            alert("Failed to update quiz. Please try again.");
        }
        setShowDropdown(null);
    };

    const handlePublishIconClick = async (e: React.MouseEvent, quizId: string, currentPublished: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await client.updateQuiz(quizId, { published: !currentPublished });
            fetchQuizzes();
        } catch (error) {
            console.error("Error toggling publish status:", error);
            alert("Failed to update quiz. Please try again.");
        }
    };

    const sortedQuizzes = getSortedQuizzes();

    return (
        <>
            <div id="wd-quizzes">
                <QuizzesButtons />
                <br /><br />

                {/* Empty State */}
                {quizzes.length === 0 ? (
                    <div className="text-center p-5 border rounded bg-light">
                        <h5 className="text-danger mb-3">No quizzes available</h5>
                        {isFaculty ? (
                            <p className="text-muted mb-0">
                                Click the <span className="text-danger fw-bold">"+ Quiz"</span> button above to create your first quiz.
                            </p>
                        ) : (
                            <p className="text-danger mb-0">Your instructor hasn't created any quizzes yet.</p>
                        )}
                    </div>
                ) : (
                    <ListGroup className="rounded-0" id="wd-modules">
                        <ListGroupItem className="wd-module p-0 mb-5 fs-5 border-gray">
                            <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center justify-content-between"> 
                                <div className="d-flex align-items-center">
                                    <BsGripVertical className="me-2 fs-3" /> 
                                    <IoMdArrowDropdown className="me-2" /> 
                                    <b>Assignment Quizzes</b>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="border rounded-pill px-3 py-1 me-1">40% of Total</span>
                                    
                                    {/* Sort Dropdown */}
                                        <Dropdown
                                            show={showSortDropdown}
                                            onToggle={(isOpen) => setShowSortDropdown(isOpen)}
                                            className="me-2"
                                        >
                                            <Dropdown.Toggle
                                                variant="outline-secondary"
                                                size="sm"
                                                id="sort-dropdown"
                                            >
                                                <FaSort className="me-1" />
                                                {getSortLabel()}
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleSortChange("name")}>
                                                    Sort by Name
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleSortChange("dueDate")}>
                                                    Sort by Due Date
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleSortChange("availableDate")}>
                                                    Sort by Available Date
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    
                                    <FaPlus className="me-4" />
                                    <IoEllipsisVertical />
                                </div>
                            </div>

                            <ListGroup className="wd-lessons rounded-0">
                                {sortedQuizzes.map((quiz: any) => {
                                    const status = getAvailabilityStatus(quiz);
                                    const numQuestions = getNumberOfQuestions(quiz._id);

                                    return (
                                        <ListGroupItem key={quiz._id} className="wd-module wd-lesson p-0 border-0 border-bottom">
                                            <div className="wd-title p-3 ps-2 bg-white d-flex align-items-center">
                                                <NoteSymbol />
                                                <div className="flex-grow-1 ms-3">
                                                    <div className="mb-1 fw-bold fs-6">
                                                        <Link 
                                                            href={`/Courses/${cid}/Quizzes/${quiz._id}`} 
                                                            className="text-black text-decoration-none"
                                                        >
                                                            {quiz.title}
                                                        </Link>
                                                    </div>
                                                    <div style={{ fontSize: '0.875rem' }}>
                                                        {status === "Closed" ? (
                                                            <span className="text-secondary">
                                                                <b>Closed</b> | <b>Due</b> {formatDate(quiz.dueDate)} at {formatTime(quiz.dueDate)} | {quiz.points} pts | {numQuestions} Questions
                                                            </span>
                                                        ) : status === "Available" ? (
                                                            <span className="text-secondary">
                                                                <b>Available</b> | <b>Due</b> <span className="text-danger">{formatDate(quiz.dueDate)} at {formatTime(quiz.dueDate)}</span> | {quiz.points} pts | {numQuestions} Questions
                                                            </span>
                                                        ) : (
                                                            <span className="text-secondary">
                                                                <b>{status}</b> {formatDate(quiz.availableDate)} at {formatTime(quiz.availableDate)} | <b>Due</b> {formatDate(quiz.dueDate)} at {formatTime(quiz.dueDate)} | {quiz.points} pts | {numQuestions} Questions
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    {isFaculty && (
                                                        <span 
                                                            className="me-2" 
                                                            style={{ cursor: "pointer" }}
                                                            onClick={(e) => handlePublishIconClick(e, quiz._id, quiz.published)}
                                                            title={quiz.published ? "Published - Click to unpublish" : "Unpublished - Click to publish"}
                                                        >
                                                            {quiz.published ? (
                                                                <FaCheckCircle className="text-success fs-5" />
                                                            ) : (
                                                                <FaBan className="text-danger fs-5" />
                                                            )}
                                                        </span>
                                                    )}
                                                    
                                                    {isFaculty && (
                                                        <Dropdown
                                                            show={showDropdown === quiz._id}
                                                            onToggle={(isOpen) => setShowDropdown(isOpen ? quiz._id : null)}
                                                        >
                                                            <Dropdown.Toggle
                                                                as="span"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setShowDropdown(showDropdown === quiz._id ? null : quiz._id);
                                                                }}
                                                            >
                                                                <IoEllipsisVertical className="fs-4"/>
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={() => handleEdit(quiz._id)}>
                                                                    Edit
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => handleDeleteClick(quiz._id, quiz.title)}>
                                                                    Delete
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => handlePublishToggle(quiz._id, quiz.published)}>
                                                                    {quiz.published ? "Unpublish" : "Publish"}
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    )}
                                                </div>
                                            </div>
                                        </ListGroupItem>
                                    );
                                })}
                            </ListGroup>
                        </ListGroupItem>
                    </ListGroup>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Quiz</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete <b>{quizToDelete?.title}</b>?</p>
                    <p className="text-muted mb-0">This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteCancel}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>
                        Delete Quiz
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
