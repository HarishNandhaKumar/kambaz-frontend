"use client";
import Link from "next/link";
import { redirect } from "next/dist/client/components/navigation";
import { setCurrentUser } from "../reducer";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { FormControl, Button } from "react-bootstrap";
import * as client from "../client";
import { useRouter } from "next/navigation";

export default function Signup() {
    const [user, setUser] = useState<any>({
        username: "",
        password: ""
    });

    const dispatch = useDispatch();
    const router = useRouter();
    const signup = async () => {
        const currentUser = await client.signup(user);
        dispatch(setCurrentUser(currentUser));
        router.push("/Account/Profile");
    };

    return (
        <div id="wd-signup-screen" className="ms-5">
        <h1>Sign up</h1>
        <FormControl value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="wd-username b-2 w-25" placeholder="username" />
        <FormControl value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })}
            className="wd-password mb-2 w-25" placeholder="password" type="password"/>
        <button onClick={signup} className="wd-signup-btn btn btn-primary mb-2 w-25"> Sign up </button><br />
        <Link href="/Account/Signin" className="wd-signin-link">Sign in</Link>
        </div>
);}