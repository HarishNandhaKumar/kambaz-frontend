import * as client from "./client";
import { useEffect, useState } from "react";
import { setCurrentUser } from "./reducer";
import { useDispatch } from "react-redux";

export default function Session({ children }: { children: any }) {
    const [pending, setPending] = useState(true);
    const dispatch = useDispatch();
    const fetchProfile = async () => {
        try {
            const currentUser = await client.profile();
            if (currentUser) {
                dispatch(setCurrentUser(currentUser));
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                dispatch(setCurrentUser(null));
            } else {
                console.error("Error fetching profile:", err);
            }
        }
        setPending(false);
    };

    useEffect(() => {
        fetchProfile();
    }, []);
    
    if (!pending) {
        return children;
    }
}