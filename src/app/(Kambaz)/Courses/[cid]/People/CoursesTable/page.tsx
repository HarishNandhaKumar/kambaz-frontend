"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Table, Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import * as client from "../../../client";

export default function CoursePeople() {
    const { cid } = useParams();
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const enrolledUsers = await client.findUsersForCourse(cid as string);
                setUsers(enrolledUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, [cid]);

    return (
        <div id="wd-people-table">
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Login ID</th>
                        <th>Section</th>
                        <th>Role</th>
                        <th>Last Activity</th>
                        <th>Total Activity</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td className="text-nowrap">
                                <FaUserCircle className="me-2 fs-3" />
                                <span className="wd-full-name text-nowrap">
                                    {user.firstName} {user.lastName}
                                </span>
                            </td>
                            <td className="wd-login-id">{user.username}</td>
                            <td className="wd-section">{user.section || "S101"}</td>
                            <td className="wd-role">{user.role}</td>
                            <td className="wd-last-activity">
                                {user.lastActivity || "--"}
                            </td>
                            <td className="wd-total-activity">
                                {user.totalActivity || "--"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}