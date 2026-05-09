"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { cid } = useParams();
    const { currentUser } = useSelector((state: RootState) => state.accountReducer);
    const { enrollments } = useSelector((state: RootState) => state.enrollmentsReducer);
    
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if user is logged in
        if (!currentUser || !(currentUser as any)._id) {
            router.push("/Account/Signin");
            setIsAuthorized(false);
            return;
        }

        // Faculty can access all courses
        if ((currentUser as any).role === "FACULTY") {
            setIsAuthorized(true);
            return;
        }

        // Check if student is enrolled in this course
        const isEnrolled = Array.isArray(enrollments) && enrollments.some(
            (enrollment) => {
                const enrolledCourseId = typeof enrollment.course === 'string' 
                    ? enrollment.course 
                    : (enrollment.course as any)?._id;
                return enrollment.user === (currentUser as any)._id && enrolledCourseId === cid;
            }
        );

        if (isEnrolled) {
            setIsAuthorized(true);
        } else {
            // Not enrolled - redirect to dashboard
            router.push("/Dashboard");
            setIsAuthorized(false);
        }
    }, [currentUser, enrollments, cid, router]);

    // Show loading while checking authorization
    if (isAuthorized === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Checking access...</span>
                </div>
            </div>
        );
    }

    // Don't render anything if not authorized
    if (!isAuthorized) {
        return null;
    }

    // User is authorized, then render the protected content
    return <>{children}</>;
}