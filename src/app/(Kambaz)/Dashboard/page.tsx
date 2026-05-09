"use client";
import { RootState } from "../store";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Row, Col, Card, CardImg, CardBody, CardTitle, CardText, Button, FormControl } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { addNewCourse, deleteCourse, updateCourse, setCourses } from "../Courses/reducer";
import { enrollCourse, unenrollCourse, setEnrollments } from "./reducer";
import * as client from "../Courses/client";

export default function Dashboard() {
    const { courses } = useSelector((state: RootState) => state.coursesReducer);
    const { currentUser } = useSelector((state: RootState) => state.accountReducer);
    const { enrollments } = useSelector((state: RootState) => state.enrollmentsReducer);
    const dispatch = useDispatch();

    // State for showing all courses or only enrolled courses
    const [showAllCourses, setShowAllCourses] = useState(false);

    const fetchCourses = async () => {
        try {
            if (showAllCourses || !currentUser) {
                const courses = await client.fetchAllCourses();
                dispatch(setCourses(courses));
            } else {
                const courses = await client.findMyCourses();
                dispatch(setCourses(courses));
            }
        } catch (err: any) {
            if (err.response?.status !== 401) {
                console.error("Error fetching courses:", err);
            }
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [currentUser, showAllCourses]);

    useEffect(() => {
        const fetchEnrollments = async () => {
            if (currentUser && (currentUser as any)?._id) {
                try {
                    const enrollmentsData = await client.findEnrollmentsForUser("current");
                    dispatch(setEnrollments(enrollmentsData));
                } catch (err: any) {
                    if (err.response?.status !== 401) {
                        console.error("Error fetching enrollments:", err);
                    }
                }
            } else {
                dispatch(setEnrollments([]));
            }
        };
        fetchEnrollments();
    }, [currentUser]);

    const refreshEnrollments = async () => {
        if (currentUser && (currentUser as any)?._id) {
            try {
                const enrollmentsData = await client.findEnrollmentsForUser("current");
                console.log("Fetched enrollments:", enrollmentsData); // ✅ Add logging
                console.log("Current courses:", courses); 
                dispatch(setEnrollments(enrollmentsData));
            } catch (error) {
                console.error("Error refreshing enrollments:", error);
            }
        }
    };

    // State for new course form
    const [course, setCourse] = useState<any>({
        _id: "0", 
        name: "New Course", 
        number: "New Number",
        startDate: "2023-09-10", 
        endDate: "2023-12-15",
        image: "/images/reactjs.jpg", 
        description: "New Description"
    });

    // Check if user is enrolled in a course
    const isEnrolled = (courseId: string) => {
        return Array.isArray(enrollments) && enrollments.some(
            (enrollment) => {
                const enrolledCourseId = typeof enrollment.course === 'string' 
                    ? enrollment.course 
                    : (enrollment.course as any)?._id;
                return enrolledCourseId === courseId;
            }
        );
    };

    // Handle enroll
    const handleEnroll = async (courseId: string, event: React.MouseEvent) => {
        event.preventDefault();
        if ((currentUser as any)?._id) {
            try {
                await client.enrollInCourse("current", courseId);
                await refreshEnrollments(); // Use helper
                await fetchCourses();
            } catch (error) {
                console.error("Enrollment error:", error);
            }
        }
    };


    // Handle unenroll
    const handleUnenroll = async (courseId: string, event: React.MouseEvent) => {
        event.preventDefault();
        if ((currentUser as any)?._id) {
            try {
                await client.unenrollFromCourse("current", courseId);
                await refreshEnrollments(); // Use helper
                await fetchCourses();
            } catch (error) {
                console.error("Unenrollment error:", error);
            }
        }
    };

    // Filter courses based on enrollment toggle
    const displayedCourses: any[] = !currentUser && !showAllCourses ? [] : (Array.isArray(courses) ? courses : []);

    // Check if current user is faculty
    const isFaculty = (currentUser as any)?.role === "FACULTY";

    const onAddNewCourse = async () => {
        try {
            const newCourse = await client.createCourse(course);
            setCourses([...courses, newCourse]);
            await fetchCourses();
            await refreshEnrollments(); // Use helper
        } catch (error) {
            console.error("Error creating course:", error);
        }
    };

    const onDeleteCourse = async (courseId: string) => {
        try {
            await client.deleteCourse(courseId);
            await fetchCourses();
            await refreshEnrollments(); // Use helper
        } catch (error) {
            console.error("Error deleting course:", error);
        }
    };

    const onUpdateCourse = async () => {
        await client.updateCourse(course);
        dispatch(setCourses((courses as any[]).map((c) => {
        if (c._id === course._id) { return course; }
        else { return c; }
        })));
    };

    return (
        <div id="wd-dashboard">
            <h1 id="wd-dashboard-title">Dashboard
                <Button 
                    variant="primary" 
                    className="float-end"
                    onClick={() => setShowAllCourses(!showAllCourses)}
                >
                    {showAllCourses ? "Show Enrolled Courses" : "Show All Courses"}
                </Button>
            </h1>
            <hr />

            {/* Faculty-only course management */}
            {isFaculty && (
                <>
                    <h5>New Course
                        <button className="btn btn-primary float-end" id="wd-add-new-course-click" 
                            onClick={onAddNewCourse}> 
                            Add 
                        </button>
                        <button className="btn btn-warning float-end me-2" id="wd-update-course-click"
                            onClick={onUpdateCourse} >
                            Update 
                        </button>
                    </h5>
                    <br />
                    <FormControl 
                        value={course.name} 
                        className="mb-2"
                        placeholder="Course Title"
                        onChange={(e) => setCourse({ ...course, name: e.target.value })} 
                    />
                    <FormControl 
                        value={course.number} 
                        className="mb-2"
                        placeholder="Course Number (e.g., CS5610)"
                        onChange={(e) => setCourse({ ...course, number: e.target.value })} 
                    />
                    <FormControl 
                        as="textarea"
                        placeholder="Course Description" 
                        value={course.description} 
                        rows={3}
                        onChange={(e) => setCourse({ ...course, description: e.target.value })} 
                    />
                    <hr />
                </>
            )}

            <h2 id="wd-dashboard-published">
                {showAllCourses ? `All Courses (${courses.length})` : `Enrolled Courses (${displayedCourses.length})`}
            </h2>

            {!currentUser && !showAllCourses && (
                <div className="alert alert-info">
                    Please sign in to view your enrolled courses.
                </div>
            )}

            <hr />

            <div id="wd-dashboard-courses">
                <Row xs={1} md={5} className="g-4">
                    {displayedCourses.map((course) => {
                        const enrolled = isEnrolled(course._id);
                        
                        return (
                            <Col key={course._id} className="wd-dashboard-course" style={{ width: "300px" }}>
                                <Card>
                                    <Link href={`/Courses/${course._id}/Home`} 
                                        className="wd-dashboard-course-link text-decoration-none text-dark">
                                        <CardImg variant="top" src="/images/reactjs.jpg" width="100%" height={160} />
                                        <CardBody>
                                            <CardTitle className="wd-dashboard-course-title text-nowrap overflow-hidden">
                                                {course.name}
                                            </CardTitle>
                                            <CardText className="wd-dashboard-course-description overflow-hidden" 
                                                style={{ height: "100px" }}>
                                                {course.description}
                                            </CardText>

                                            {/* Go Button - Only for enrolled users */}
                                            {enrolled && (<Button variant="primary">Go</Button>)}

                                            {/* Enroll/Unenroll Buttons */}
                                            {showAllCourses && (
                                                <>
                                                    {enrolled ? (
                                                        <Button variant="danger" className="float-end"
                                                            onClick={(e) => handleUnenroll(course._id, e)}>
                                                            Unenroll
                                                        </Button>
                                                    ) : (
                                                        <Button variant="success" className="float-end"
                                                            onClick={(e) => handleEnroll(course._id, e)}>
                                                            Enroll
                                                        </Button>
                                                    )}
                                                </>
                                            )}

                                            {/* Faculty-only Edit/Delete Buttons */}
                                            {isFaculty && (
                                                <>
                                                    <button 
                                                        onClick={(event) => {
                                                            event.preventDefault(); 
                                                            onDeleteCourse(course._id);
                                                        }} 
                                                        className="btn btn-danger float-end ms-2" 
                                                        id="wd-delete-course-click"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button 
                                                        id="wd-edit-course-click" 
                                                        onClick={(event) => {
                                                            event.preventDefault(); 
                                                            setCourse(course);
                                                        }}
                                                        className="btn btn-warning float-end" 
                                                    >
                                                        Edit
                                                    </button>
                                                </>
                                            )}
                                        </CardBody>
                                    </Link>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        </div>
    );
}