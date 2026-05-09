import {ListGroupItem} from "react-bootstrap";
import Button from "react-bootstrap/esm/Button";
import FormControl from "react-bootstrap/esm/FormControl";
import { useSelector, useDispatch } from "react-redux";
import { addTodo, updateTodo, setTodo } from "./todosReducer";
import { RootState } from "../../../store";

export default function TodoForm() {
    const { todo } = useSelector((state: RootState) => state.todosReducer);
    const dispatch = useDispatch();
return (
    <ListGroupItem className="d-flex align-items-center w-25">
        <FormControl value={todo.title} className="me-2"
            onChange={ (e) => dispatch(setTodo({ ...todo, title: e.target.value })) }/>
        <Button onClick={() => dispatch(updateTodo(todo))} className="me-2" variant="warning"
            id="wd-update-todo-click"> Update </Button>
        <Button onClick={() => dispatch(addTodo(todo))} variant="success"
            id="wd-add-todo-click"> Add </Button>
    </ListGroupItem>
);}