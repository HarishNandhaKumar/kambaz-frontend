"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PeopleTable from "../../../Courses/[cid]/People/Table";
import * as client from "../../client";
import { FormControl } from "react-bootstrap";
import PeopleDetails from "../../../Courses/[cid]/People/Details/page";

export default function Users() {
    
    const [users, setUsers] = useState<any[]>([]);
    const { uid } = useParams();

    const [role, setRole] = useState("");
    const filterUsersByRole = async (role: string) => {
        setRole(role);
        if (role) {
            const users = await client.findUsersByRole(role);
            setUsers(users);
        } else {
            fetchUsers();
        }
    };

    const fetchUsers = async () => {
        const users = await client.findAllUsers();
        setUsers(users);
    };
    useEffect(() => {
        fetchUsers();
    }, [uid]);

    const [name, setName] = useState("");
    const filterUsersByName = async (name: string) => {
        setName(name);
        if (name) {
            const users = await client.findUsersByPartialName(name);
            setUsers(users);
        } else {
            fetchUsers();
        }
    };

    return (
        <div>
            <h3>Users</h3>
            <FormControl onChange={(e) => filterUsersByName(e.target.value)} placeholder="Search people"
                className="float-start w-25 me-2 wd-filter-by-name" />
            <select value={role} onChange={(e) =>filterUsersByRole(e.target.value)}
                className="form-select float-start w-25 wd-select-role" >
                <option value="">All Roles</option> <option value="STUDENT">Students</option>
                <option value="TA">Assistants</option> <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Administrators</option>
            </select>
            <PeopleDetails />
            <PeopleTable users={users} />
        </div>
    );
}