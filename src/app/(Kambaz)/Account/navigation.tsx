"use client";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Nav, NavItem, NavLink } from "react-bootstrap";
import { usePathname } from "next/navigation";

export default function AccountNavigation() {
    const { currentUser } = useSelector((state: RootState) => state.accountReducer);
    const links = currentUser ? ["Profile"] : ["Signin", "Signup"];
    const pathname = usePathname();
    return (
        <Nav variant="pills">
            {links.map((link) => (
                <NavItem key={link}>
                    <NavLink as={Link} href={`/Account/${link}`} active={pathname.endsWith(link.toLowerCase())}>
                        {link} 
                    </NavLink> 
                </NavItem>
            ))}

            {currentUser && currentUser.role === "ADMIN" && (
                <NavItem key="Users">
                    <NavLink as={Link} href="/Account/Users" active={pathname.includes("Users")}>
                        Users
                    </NavLink>
                </NavItem> 
            )}
        </Nav>
    );
}