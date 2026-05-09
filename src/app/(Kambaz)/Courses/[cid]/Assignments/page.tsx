"use client";
import AssignmentButtons from "./AssignmentButtons";
import { Button, ListGroup, ListGroupItem, Modal } from "react-bootstrap";
import { BsGripVertical } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { IoEllipsisVertical } from "react-icons/io5";
import { NoteSymbol } from "./NoteSymbol"
import GreenCheckmark from "../Modules/GreenCheckmark";
import Link from "next/link";
import * as db from "../../../Database";
import { useParams } from "next/navigation";
import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { deleteAssignment, setAssignments } from "./reducer";
import * as client from "../../client";

export default function Assignments() {
    const { cid } = useParams();
    const { assignments } = useSelector((state: RootState) => state.assignmentsReducer);
    const assignment = db.assignments.filter(assignment => assignment.course === cid);
    const [assignmentId, setAssignmentId] = useState<string>("new");
    const dispatch = useDispatch();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<{
        id: string;
        title: string;
    } | null>(null);

    const fetchAssignments = async () => {
        const assignments = await client.findAssigmentsForCourse(cid as string);
        dispatch(setAssignments(assignments));
    };
    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleDeleteClick = (assignmentId: string, assignmentTitle: string) => {
        setAssignmentToDelete({ id: assignmentId, title: assignmentTitle });
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
    if (assignmentToDelete) {
        try {
            await client.deleteAssignment(assignmentToDelete.id);
            dispatch(deleteAssignment(assignmentToDelete.id));
        } catch (error) {
            console.error("Error deleting assignment:", error);
        }
    }
    setShowDeleteDialog(false);
    setAssignmentToDelete(null);
};

    const handleCancelDelete = () => {
        setShowDeleteDialog(false);
        setAssignmentToDelete(null);
    };

return (
    <>
    <div id="wd-assignments">
        <AssignmentButtons />
        <br /><br />
        <ListGroup className="rounded-0" id="wd-modules">
            <ListGroupItem className="wd-module p-0 mb-5 fs-5 border-gray">
                <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center justify-content-between"> 
                    <div className="d-flex align-items-center">
                        <BsGripVertical className="me-2 fs-3" /> 
                        <IoMdArrowDropdown className="me-2" /> 
                        <b>ASSIGNMENTS</b>
                    </div>
                    <div className="d-flex align-items-center">
                        <span className="border rounded-pill px-3 py-1 me-1">40% of Total</span><FaPlus className="me-4" />
                        <IoEllipsisVertical />
                    </div>
                </div>

                <ListGroup className="wd-lessons rounded-0">
                    {assignments.map((assignment: any) => (
                        <ListGroupItem key={assignment._id} className="wd-module wd-lesson p-0 fs-5">
                            <div className="wd-title p-3 ps-2 bg-white d-flex align-items-center">
                                <BsGripVertical className="me-4 fs-3" />
                                <NoteSymbol />
                                <div className="flex-grow-1 ms-5 me-4">
                                    <h6 className="mb-1 fw-bold">
                                        <Link href={`/Courses/${cid}/Assignments/${assignment._id}`} className="wd-assignment-link text-black text-decoration-none">
                                            {assignment.title}
                                        </Link>
                                    </h6>
                                    <div className="small text-muted">
                                        <span className="text-danger">Multiple Modules</span>
                                        <span> | <b>Not available until</b> {assignment.avail_date} at {assignment.avail_time} |</span>
                                    </div>
                                    <div className="small text-muted">
                                        <span><b>Due</b> {assignment.due_date} at {assignment.due_time} | {assignment.points} pts</span>
                                    </div>
                                </div>
                                <div className="float-end">
                                    <span className="me-3" onClick={() => handleDeleteClick(assignment._id, assignment.title)} style={{ cursor: "pointer" }}>
                                        <FaRegTrashAlt />
                                    </span>
                                    <span className="me-3">
                                        <GreenCheckmark />
                                    </span>
                                    <IoEllipsisVertical className="fs-4"/>
                                </div>
                            </div>
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </ListGroupItem>
        </ListGroup>
    </div>

    {/* Delete Confirmation Modal */}
    <Modal show={showDeleteDialog} onHide={handleCancelDelete} centered>
        <Modal.Header closeButton>
            <Modal.Title>Delete Assignment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to remove the assignment "{assignmentToDelete?.title}"?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCancelDelete}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleConfirmDelete}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>        
    </>
);}