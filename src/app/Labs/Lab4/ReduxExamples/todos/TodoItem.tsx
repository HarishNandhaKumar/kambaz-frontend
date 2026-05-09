import React from "react";
import { useDispatch } from "react-redux";
import { deleteTodo, setTodo } from "./todosReducer";
import Button from "react-bootstrap/esm/Button";
import { ListGroupItem } from "react-bootstrap";

export default function TodoItem({ todo }: { todo: any }) {
    const dispatch = useDispatch();
return (
    <ListGroupItem key={todo.id} className="d-flex justify-content-between align-items-center w-25">
        {todo.title}
        <div>
            <Button onClick={() => dispatch(setTodo(todo))} className="me-2" variant="primary"
                id="wd-set-todo-click"> Edit </Button>
            <Button onClick={() => dispatch(deleteTodo(todo.id))} variant="danger"
                id="wd-delete-todo-click"> Delete </Button>
        </div>
    </ListGroupItem>
);}