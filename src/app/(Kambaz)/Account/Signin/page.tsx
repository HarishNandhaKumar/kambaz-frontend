"use client";
import * as client from "../client";
import Link from "next/link";
import { redirect } from "next/dist/client/components/navigation";
import { setCurrentUser } from "../reducer";
import { useDispatch } from "react-redux";
import { useState } from "react";
import * as db from "../../Database";
import { FormControl, Button } from "react-bootstrap";

export default function Signin() {
    const [credentials, setCredentials] = useState<any>({});
    const dispatch = useDispatch();
    
    const signin = async () => {
        const user = await client.signin(credentials);
        if (!user) return;
        dispatch(setCurrentUser(user));
        redirect("/Dashboard");
    };
    return (
        <div id="wd-signin-screen" className="ms-5">
            <h1>Sign in</h1>
            <FormControl defaultValue={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="mb-2 w-25" placeholder="username" id="wd-username" />
            <FormControl defaultValue={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="mb-2 w-25" placeholder="password" type="password" id="wd-password" />
            <Button onClick={signin} id="wd-signin-btn" className="w-25" > Sign in </Button>
            <br />
            <Link id="wd-signup-link" href="/Account/Signup"> Sign up </Link>
        </div>
);}