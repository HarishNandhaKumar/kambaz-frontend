"use client";
import React, { useState } from "react";
import { FormControl } from "react-bootstrap";

const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;

export default function WorkingWithArrays() {
    const API = `${HTTP_SERVER}/lab5/todos`;
    const [todo, setTodo] = useState(
        {
            id: "1",
            title: "NodeJS Assignment",
            description: "Create a NodeJS server with ExpressJS",
            due: "2021-09-09",
            completed: false,
        }
    );
    return (
        <div id="wd-working-with-arrays">
            <h3>Working with Arrays</h3>
            <h4>Retrieving Arrays</h4>
            <a id="wd-retrieve-todos" className="btn btn-primary" href={API}>Get Todos</a>
            <hr/>
            <h4>Retrieving an Item from an Array by ID</h4>
            <a id="wd-retrieve-todo-by-id" className="btn btn-primary float-end" href={`${API}/${todo.id}`}>
                Get Todo by ID
            </a>
            <FormControl id="wd-todo-id" defaultValue={todo.id} className="w-50"
                onChange={(e) => setTodo({ ...todo, id: e.target.value })} />
            <hr />
            <h3>Filtering Array Items</h3>
            <a id="wd-retrieve-completed-todos" className="btn btn-primary" href={`${API}?completed=true`}>
                Get Completed Todos
            </a>
            <hr/>
            <h3>Creating new Items in an Array</h3>
            <a id="wd-retrieve-completed-todos" className="btn btn-primary" href={`${API}/create`}>
                Create Todo
            </a>
            <hr/>
            <h3>Removing from an Array</h3>
            <a id="wd-remove-todo" className="btn btn-primary float-end" href={`${API}/${todo.id}/delete`}>
                Remove Todo with ID = {todo.id} </a>
            <FormControl defaultValue={todo.id} className="w-50" onChange={(e) => setTodo({ ...todo, id: e.target.value })}/>
            <hr/>

            <h3>Updating an Item in an Array</h3>
            <a href={`${API}/${todo.id}/title/${todo.title}`} className="btn btn-primary float-end">Update Todo</a>
            <FormControl defaultValue={todo.id} className="w-25 float-start me-2"
                onChange={(e) => setTodo({ ...todo, id: e.target.value })}/>
            <FormControl defaultValue={todo.title} className="w-50 float-start"
                onChange={(e) => setTodo({ ...todo, title: e.target.value }) }/>
            <br /><br /><hr />

            <h4>Updating Completed Status</h4>
            <div className="mb-3">
                <FormControl defaultValue={todo.id} className="w-25 float-start me-2"
                    onChange={(e) => setTodo({ ...todo, id: e.target.value })}/>
                <input className="form-check-input me-2" id="wd-todo-completed" type="checkbox" checked={todo.completed} 
                    onChange={(e) => setTodo({ ...todo, completed: e.target.checked })}/>
                <label htmlFor="wd-todo-completed" className="form-check-label me-3">
                    Completed
                </label>
                <a id="wd-update-todo-completed" className="btn btn-primary" href={`${API}/${todo.id}/completed/${todo.completed}`}>
                    Update Completed Status
                </a>
            </div>
            <hr />

            {/* Update Description */}
            <h4>Updating Description</h4>
            <FormControl defaultValue={todo.id} className="w-25 float-start me-2"
                onChange={(e) => setTodo({ ...todo, id: e.target.value })}/>
            <FormControl id="wd-todo-description" as="textarea" rows={3} className="w-75 mb-2"
                value={todo.description}onChange={(e) => setTodo({ ...todo, description: e.target.value })}/>
            <a id="wd-update-todo-description" className="btn btn-primary" href={`${API}/${todo.id}/description/${todo.description}`}>
                Update Description
            </a>
            <hr />

        </div>
);}