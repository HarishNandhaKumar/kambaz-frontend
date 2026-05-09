"use client";
import { ReactNode, useState } from "react";
import CourseNavigation from "./navigation";
import { FaAlignJustify } from "react-icons/fa";
import Breadcrumb from "./Breadcrumb";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { RootState } from "../../store";
import ProtectedRoute from "./protectedRoute";


export default function CoursesLayout({ children }: { children: ReactNode }) {
    const { cid } = useParams();
    const { courses } = useSelector((state: RootState) => state.coursesReducer);
    const course = courses.find((course: any) => course._id === cid);
    const [showNavigation, setShowNavigation] = useState(true);

return (
    <ProtectedRoute>
        <div id="wd-courses">
            <h2 className="text-danger">
                <FaAlignJustify className="me-4 fs-4 mb-1" onClick={() => setShowNavigation(!showNavigation)} style={{ cursor: "pointer" }}/>
                <Breadcrumb course={course} />
            </h2>
            <hr />
            <div className="d-flex">
                {showNavigation && (
                    <div className="d-none d-md-block">
                        <CourseNavigation />
                    </div>
                )}
                <div className="flex-fill">
                    {children}
                </div>
            </div>
        </div>
    </ProtectedRoute>
);}