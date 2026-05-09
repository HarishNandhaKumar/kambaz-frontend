"use client";
import { useState, useEffect } from "react";
import { Button, Form, FormSelect, ListGroup, ListGroupItem } from "react-bootstrap";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { BsCalendar3 } from "react-icons/bs";
import { addAssignment, updateAssignment } from "../reducer";
import { RootState } from "../../../../store";
import * as client from "../../../client";

export default function AssignmentEditor() {
    const { cid, aid } = useParams();
    const router = useRouter();
    const dispatch = useDispatch();

    // Check if creating new assignment
    const isNewAssignment = aid === "new";

    // Get assignment from Redux store
    const { assignments } = useSelector((state: RootState) => state.assignmentsReducer);
    const assignment = isNewAssignment ? null : assignments.find((a: any) => a._id === aid) as any;

    // Form state - all editable fields
    const [formData, setFormData] = useState({
        title: "",
        description: "The assignment is available online\n\nSubmit a link to the landing page of your Web application running on Vercel.\n\nThe landing page should include the following:\n• Your full name and section\n• Links to each of the lab assignments\n• Link to the Kanbas application\n• Links to all relevant source code repositories\n\nThe Kanbas application should include a link to navigate back to the landing page.",
        points: 100,
        due_date: "",
        due_time: "23:59",
        avail_date: "",
        avail_time: "00:00",
        avail_until_date: "",
        avail_until_time: "23:59",
    });

    // Load existing assignment data when editing
    useEffect(() => {
        if (!isNewAssignment && assignment) {
            setFormData({
                title: assignment.title || "",
                description: assignment.description || "",
                points: assignment.points || 100,
                due_date: assignment.due_date || "",
                due_time: assignment.due_time || "23:59",
                avail_date: assignment.avail_date || "",
                avail_time: assignment.avail_time || "00:00",
                avail_until_date: assignment.avail_until_date || "",
                avail_until_time: assignment.avail_until_time || "23:59",
            });
        }
    }, [assignment, isNewAssignment]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Assignment Creation and Updating it
    const handleSave = async () => {

        if (!formData.title.trim()) {
            alert("Please enter an assignment name");
            return;
        }

        if (!cid || Array.isArray(cid)) return;

        try {
            if (isNewAssignment) {
                // Create new assignment
                const newAssignmentData = {
                    title: formData.title,
                    description: formData.description,
                    points: formData.points,
                    avail_date: formData.avail_date,
                    avail_time: formData.avail_time,
                    due_date: formData.due_date,
                    due_time: formData.due_time,
                    avail_until_date: formData.avail_until_date,
                    avail_until_time: formData.avail_until_time,
                };
                
                const createdAssignment = await client.createAssignmentForCourse(cid, newAssignmentData);
                dispatch(addAssignment(createdAssignment));
            } else {
                // Update existing assignment
                const updatedAssignmentData = {
                    ...assignment,
                    title: formData.title,
                    description: formData.description,
                    points: formData.points,
                    avail_date: formData.avail_date,
                    avail_time: formData.avail_time,
                    due_date: formData.due_date,
                    due_time: formData.due_time,
                    avail_until_date: formData.avail_until_date,
                    avail_until_time: formData.avail_until_time,
                };
                
                const updatedAssignment = await client.updateAssignment(updatedAssignmentData);
                dispatch(updateAssignment(updatedAssignment));
            }
            
            // Navigate back to assignments list
            router.push(`/Courses/${cid}/Assignments`);
        } catch (error) {
            console.error("Error saving assignment:", error);
            alert("Failed to save assignment");
        }
    };

    // Cancel handler
    const handleCancel = () => {
        router.push(`/Courses/${cid}/Assignments`);
    };

    return (
        <div id="wd-assignments-editor" className="container mt-3 ms-5">
            <ListGroup className="rounded-0">
                {/* Assignment Name */}
                <ListGroupItem className="border-0 px-4 pt-4 pb-2 w-50">
                    <Form.Label htmlFor="wd-name">Assignment Name</Form.Label>
                    <Form.Control 
                        id="wd-name"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="New Assignment"
                        className="mt-2" 
                    />
                </ListGroupItem>

                {/* Description */}
                <ListGroupItem className="border-0 px-4 pt-2 pb-4 w-50">
                    <Form.Control 
                        as="textarea"
                        id="wd-description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={10}
                        className="border rounded p-3 mt-2 bg-white"
                    />
                </ListGroupItem>

                {/* Points */}
                <ListGroupItem className="border-0 px-4 pt-2 pb-4 w-50">
                    <div className="d-flex align-items-center gap-3 justify-content-end">
                        <Form.Label htmlFor="wd-points" className="mb-0 text-end">Points</Form.Label>
                        <Form.Control 
                            id="wd-points"
                            name="points"
                            type="number"
                            value={formData.points}
                            onChange={handleChange}
                            className="w-75" 
                        />
                    </div>
                </ListGroupItem>

                {/* Assignment Group */}
                <ListGroupItem className="border-0 px-4 pt-2 pb-4 w-50">
                    <div className="d-flex align-items-center gap-3 justify-content-end">
                        <div className="col-md-3">
                            <Form.Label htmlFor="wd-group" className="mb-0 text-end">Assignment Group</Form.Label>
                        </div>
                        <div className="col-md-9">
                            <FormSelect id="wd-group" defaultValue="ASSIGNMENTS">
                                <option value="ASSIGNMENTS">ASSIGNMENTS</option>
                                <option value="QUIZZES">QUIZZES</option>
                                <option value="EXAMS">EXAMS</option>
                                <option value="PROJECT">PROJECT</option>
                            </FormSelect>
                        </div>
                    </div>
                </ListGroupItem>

                {/* Display Grade As */}
                <ListGroupItem className="border-0 px-4 pt-2 pb-4 w-50">
                    <div className="d-flex align-items-center gap-3 justify-content-end">
                        <div className="col-md-3">
                            <Form.Label htmlFor="wd-display-grade-as" className="mb-0 text-end">Display Grade as</Form.Label>
                        </div>
                        <div className="col-md-9">
                            <FormSelect id="wd-display-grade-as" defaultValue="Percentage">
                                <option value="Percentage">Percentage</option>
                                <option value="Points">Points</option>
                                <option value="Complete/Incomplete">Complete/Incomplete</option>
                                <option value="Letter Grade">Letter Grade</option>
                            </FormSelect>
                        </div>
                    </div>
                </ListGroupItem>

                {/* Submission Type */}
                <ListGroupItem className="border-0 px-4 pt-2 pb-4 w-50">
                    <div className="row">
                        <div className="col-md-3">
                            <Form.Label htmlFor="wd-submission-type" className="mb-0 text-nowrap text-end">Submission Type</Form.Label>
                        </div>
                        <div className="col-md-9">
                            <div className="border rounded p-3">
                                <FormSelect id="wd-submission-type" defaultValue="Online">
                                    <option value="Online">Online</option>
                                    <option value="On Paper">On Paper</option>
                                    <option value="External Tool">External Tool</option>
                                    <option value="No Submission">No Submission</option>
                                </FormSelect>

                                <div className="mt-3">
                                    <Form.Label className="fw-bold">Online Entry Options</Form.Label>
                                    <div className="mt-2">
                                        <Form.Check 
                                            type="checkbox" 
                                            id="wd-text-entry"
                                            label="Text Entry"
                                            className="mb-3" 
                                        />
                                        <Form.Check 
                                            type="checkbox" 
                                            id="wd-website-url"
                                            label="Website URL" 
                                            defaultChecked
                                            className="mb-3"
                                        />
                                        <Form.Check 
                                            type="checkbox" 
                                            id="wd-media-recordings"
                                            label="Media Recordings" 
                                            className="mb-3"
                                        />
                                        <Form.Check 
                                            type="checkbox" 
                                            id="wd-student-annotation"
                                            label="Student Annotation"
                                            className="mb-3" 
                                        />
                                        <Form.Check 
                                            type="checkbox" 
                                            id="wd-file-upload"
                                            label="File Uploads"
                                            className="mb-3" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ListGroupItem>

                {/* Assign Section with Date/Time Inputs */}
                <ListGroupItem className="border-0 px-4 pt-2 pb-4 w-50">
                    <div className="row">
                        <div className="col-md-3 text-end">
                            <Form.Label className="mb-0 text-nowrap text-end">Assign</Form.Label>
                        </div>
                        <div className="col-md-9">
                            <div className="border rounded p-3">
                                <Form.Label htmlFor="wd-assign-to" className="fw-bold">Assign to</Form.Label>
                                <div className="border rounded p-2 mb-3 bg-white d-flex align-items-center">
                                    <span className="badge bg-light text-dark border me-2">
                                        Everyone
                                        <button type="button" className="btn-close btn-close-sm ms-2" style={{ fontSize: "10px" }}></button>
                                    </span>
                                </div>

                                {/* Due Date */}
                                <Form.Label htmlFor="wd-due-date" className="fw-bold">Due</Form.Label>
                                <div className="d-flex align-items-center border rounded bg-white mb-3">
                                    <Form.Control
                                        type="date"
                                        id="wd-due-date"
                                        name="due_date"
                                        value={formData.due_date}
                                        onChange={handleChange}
                                        className="border-0 flex-grow-1"
                                    />
                                </div>

                                {/* Available From and Until */}
                                <div className="row">
                                    <div className="col-md-6">
                                        <Form.Label htmlFor="wd-available-from" className="fw-bold">Available from</Form.Label>
                                        <div className="d-flex align-items-center border rounded bg-white">
                                            <Form.Control
                                                type="date"
                                                id="wd-available-from"
                                                name="avail_date"
                                                value={formData.avail_date}
                                                onChange={handleChange}
                                                className="border-0 flex-grow-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Label htmlFor="wd-available-until" className="fw-bold">Until</Form.Label>
                                        <div className="d-flex align-items-center border rounded bg-white">
                                            <Form.Control
                                                id="wd-available-until"
                                                name="avail_until_date"
                                                type="date"
                                                value={formData.avail_until_date}
                                                onChange={handleChange}
                                                className="border-0 flex-grow-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ListGroupItem>
            </ListGroup>

            {/* Action Buttons */}
            <div className="w-50 px-4 border-top mt-4 pt-3 d-flex justify-content-end gap-2">
                <Button variant="light" className="border" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleSave}>
                    Save
                </Button>
            </div>
        </div>
    );
}