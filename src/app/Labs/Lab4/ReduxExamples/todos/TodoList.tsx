import React from "react";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";
import { useSelector } from "react-redux";
import ListGroup from "react-bootstrap/esm/ListGroup";
import { RootState } from "../../../store";

export default function TodoList() {
    const { todos } = useSelector((state: RootState) => state.todosReducer);
return (
    <div id="wd-todo-list-redux">
        <h2>Todo List</h2>
        <ListGroup>
        <TodoForm />
        {todos.map((todo: any) => (
            <TodoItem key={todo.id} todo={todo} />
        ))}
        </ListGroup>
        <hr/>
    </div>
);}