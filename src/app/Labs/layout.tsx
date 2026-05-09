import { ReactNode } from "react";
import TOC from "./TOC";
import "./styles.css";
import KambazNavigation from "../(Kambaz)/navigation";

export default function LabsLayout({
    children,
}: Readonly<{ children: ReactNode }>) {
    return (
        <div id="wd-kambaz">
            <div className="d-flex">
                <KambazNavigation />
            </div>
            <div className="wd-main-content-offset p-3 d-flex">
                <TOC />
            </div>
            <div className="wd-main-content-offset p-3 flex-fill">
                {children}
            </div>
        </div>
);}