"use client";
import React from "react";
import { usePathname } from "next/navigation";

export default function Breadcrumb({ course }: { course: { name: string } | undefined; }) {
    const pathname = usePathname();
    console.log("Breadcrumb - course:", course, "pathname:", pathname); // Debug
    return (
        <span>
            {course?.name} &gt; {pathname.split("/").pop()}
        </span>
);}