import express from "express";
import { authMiddleware } from "../midelwares/authMidelware.js";
import { createTodo, deleteTodo, getAllTodos, updateTodo,completeTodo} from "../controllers/todoController.js";
const todoRouter=express.Router()

todoRouter.post('/create', authMiddleware,createTodo);
todoRouter.get('/getall',getAllTodos);
todoRouter.post('/complete',authMiddleware,completeTodo)
todoRouter.put('/update', authMiddleware,updateTodo);
todoRouter.delete('/delete',authMiddleware,deleteTodo)

export default todoRouter