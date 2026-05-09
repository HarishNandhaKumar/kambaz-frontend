"use client";
import React, { useState } from "react";
import { FormControl } from "react-bootstrap";

const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;

export default function WorkingWithObjects() {

    const [assignment, setAssignment] = useState({
        id: 1, title: "NodeJS Assignment",
        description: "Create a NodeJS server with ExpressJS",
        due: "2021-10-10", completed: false, score: 0,
    });

    const [module, setModule] = useState({
        id: "CS5610",
        name: "Web Development",
        description: "Learn full-stack web development",
        course: "Computer Science"
    })

    const ASSIGNMENT_API_URL = `${HTTP_SERVER}/lab5/assignment`
    const MODULE_API_URL = `${HTTP_SERVER}/lab5/module`

    return (
        <div id="wd-working-with-objects">
            <h4>Modifying Properties</h4>
            <a id="wd-update-assignment-title" className="btn btn-primary float-end"
                href={`${ASSIGNMENT_API_URL}/title/${assignment.title}`}> Update Assignment Title </a>

            <FormControl className="w-75" id="wd-assignment-title"
                defaultValue={assignment.title} onChange={(e) =>setAssignment({ ...assignment, title: e.target.value })}/>
            <hr />

            <a id="wd-update-assignment-score" className="btn btn-primary float-end"
                href={`${ASSIGNMENT_API_URL}/score/${assignment.score}`}> Update Assignment Score </a>

            <input className="w-75" id="wd-assignment-score" type="number"
                defaultValue={assignment.score} onChange={(e) =>setAssignment({ ...assignment, score: parseInt(e.target.value) })}/>
            <hr />

            <div className="row mb-3 align-items-center">
                <div className="col-12 d-flex align-items-center justify-content-between">
                    <input className="w-75" id="wd-assignment-status" type="checkbox" 
                        checked={assignment.completed} onChange={(e) =>setAssignment({ ...assignment, completed: e.target.checked })}/>
                    <a id="wd-update-assignment-status" className="btn btn-primary justify-center"
                        href={`${ASSIGNMENT_API_URL}/completed/${assignment.completed}`}> Update Assignment Status </a>
                    </div>
            </div>
            <hr />

            <a id="wd-update-module-name" className="btn btn-primary float-end"
                href={`${MODULE_API_URL}/name/${module.name}`}> Update Module Name </a>
            
            <FormControl className="w-75" id="wd-module-name"
                defaultValue={module.name} onChange={(e) =>setModule({ ...module, name: e.target.value })}/>
            <hr />

            <a id="wd-update-module-description" className="btn btn-primary float-end"
                href={`${MODULE_API_URL}/description/${module.description}`}> Update Module Description </a>
            
            <FormControl className="w-75" id="wd-module-description"
                defaultValue={module.description} onChange={(e) =>setModule({ ...module, description: e.target.value })}/>
            <hr />

            <h3>Working With Objects</h3>
            <h4>Retrieving Objects</h4>
            <a id="wd-retrieve-assignments" className="btn btn-primary" href={`${HTTP_SERVER}/lab5/assignment`}>
                Get Assignment
            </a>
            <hr/>
            <h4>Retrieving Properties</h4>
            <a id="wd-retrieve-assignment-title" className="btn btn-primary" href={`${HTTP_SERVER}/lab5/assignment/title`}>
                Get Title
            </a>
            <hr/>
            <h4>Retrieving Module</h4>
            <a id="wd-retrieve-module" className="btn btn-primary" href={`${HTTP_SERVER}/lab5/module`}>
                Get Module Properties
            </a>
            <hr />
            <h4>Retrieving Module Properties</h4>
            <a id="wd-retrieve-module-name" className="btn btn-primary" href={`${HTTP_SERVER}/lab5/module/name`}>
                Get Module Name
            </a>
            <hr />
            <a id="wd-retrieve-module-description" className="btn btn-primary" href={`${HTTP_SERVER}/lab5/module/description`}>
                Get Module Description
            </a>
            <hr />
        </div>
);}