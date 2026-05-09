"use client";

import Link from "next/link";
export default function Labs() {
    return (
            <div id="wd-labs">
                <h1>Labs & Project</h1>
                <div className="border rounded p-3 mb-4 bg-primary text-white d-inline-block" >
                    <h5>Team Member Name: Harish Nandha Kumar</h5>
                    <h5>Number of Team Members: 1</h5>
                </div>
                    <ul>
                        <li>
                            <Link href="/Labs/Lab1" id="wd-lab1-link">
                                Lab 1: HTML Examples </Link>
                        </li>
                        <li>
                            <Link href="/Labs/Lab2" id="wd-lab2-link">
                                Lab 2: CSS Basics </Link>   
                        </li>
                        <li>
                            <Link href="/Labs/Lab3" id="wd-lab3-link">
                                Lab 3: JavaScript Fundamentals </Link>
                        </li>
                        <li>
                            <Link href="/Labs/Lab4" id="wd-lab4-link">
                                Lab 4: Maintaining State in React Applications </Link>
                        </li>
                        <li>
                            <Link href="/Labs/Lab5" id="wd-lab5-link">
                                Lab 5: Implementing RESTful web APIs wiht Express.js </Link>
                        </li>
                        <li>
                            <Link href="/" id="wd-lab3-link">
                                Kambaz </Link> 
                        </li>
                        <li>
                            <Link href="https://github.com/HarishNandhaKumar/kambaz-next-js.git" id="wd-lab3-link">
                                My Github Repo - NextJS [Git Branch Name: Project/Quizzes]</Link> 
                        </li>
                        <li>
                            <Link href="https://github.com/HarishNandhaKumar/kambaz-node-server-app.git" id="wd-lab3-link">
                                My Github Repo - Node Server [Git Branch Name: Project/Quizzes]</Link> 
                        </li>
                    </ul>
            </div>
);}