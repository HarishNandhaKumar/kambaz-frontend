"use client";
import { Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { useParams, useRouter } from "next/navigation";

export default function AssignmentButtons() {
    const { cid } = useParams();  // Get cid from URL params
    const router = useRouter();
    
    const handleAddAssignment = () => {
        router.push(`/Courses/${cid}/Assignments/new`);
    };
    
    return (
        <div className="d-flex align-items-center justify-content-between">
            <div className="position-relative" style={{ width: "300px" }}>
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: "14px" }} />
                <input type="text" className="form-control ps-5" placeholder="Search..." style={{ boxShadow: "none" }} />
            </div>
            <div className="d-flex align-items-center">
                <Button variant="secondary" size="lg" className="me-2" id="wd-add-group-btn">
                    <FaPlus className="position-relative me-2" style={{ bottom: "1px" }} />
                    Group
                </Button>
                <Button variant="danger" size="lg" id="wd-add-assignment-btn" onClick={handleAddAssignment}>
                    <FaPlus className="position-relative me-2" style={{ bottom: "1px" }} />
                    Assignment
                </Button>
            </div>
        </div>
);}