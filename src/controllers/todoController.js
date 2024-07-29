import Todo from '../models/todoModel.js';
import createHttpError from 'http-errors';

const createTodo = async (req, res, next) => {
  console.log("create todo req query", req.body);

    const { task, userId } = req.body; // Change from req.query to req.body
    console.log(task, userId);
    if (!task || !userId) {
      const error = createHttpError(400, 'All fields are required');
      return next(res.json({ error }));
    }
    try {
      const todoExist = await Todo.findOne({ userId, task });
      if (todoExist) {
        const error = createHttpError(400, 'Todo already exists for this user');
        return next(res.json({ error }));
      }
      const newTodo = new Todo({
        userId,
        task,
      });
      console.log("newTodo", newTodo);
      const savedTodo = await newTodo.save();
       res.status(201).json({ savedTodo });
    } catch (error) {
      const err = createHttpError(500, 'Internal Server Error');
      return next(res.json({ err }));
    }
  };

  const completeTodo = async (req, res, next) => {
    const { id } = req.body;
    console.log("id", id);
    if (!id) {
      const error = createHttpError(400, 'All fields are required');
      return next(error);
    }
    try {
      // Find the todo item by id
      const todo = await Todo.findById(id);
      if (!todo) {
        const error = createHttpError(404, 'Todo not found');
        return next(error);
      }
  
      // Toggle the completed status
      todo.completed = !todo.completed;
  
      // Save the updated todo item
      const updatedTodo = await todo.save();
  
      res.status(200).json({ updatedTodo });
    } catch (error) {
      const err = createHttpError(500, 'Internal Server Error');
      return next(err);
    }
  };
  

const getAllTodos = async (req, res, next) => {
    const { userId } = req.query;
    try {
        const todos = await Todo.find({ userId });
        res.status(200).json({ todos });
    } catch (error) {
        const err = createHttpError(500, 'Internal Server Error');
        return next(err);
    }
};



const updateTodo = async (req, res, next) => {
  console.log("request of update todo body", req.body);
  const { id, task } = req.body;
  console.log("id, task", id, task);
  if (!id || !task) {
    const error = createHttpError(400, 'All fields are required');
    return next(error);
  }
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(id, { task }, { new: true });
    res.status(200).json({ updatedTodo });
    console.log("updatedTodo", updatedTodo);
  } catch (error) {
    const err = createHttpError(500, 'Internal Server Error');
    return next(err);
  }
};


const deleteTodo = async (req, res, next) => {
    const { id } = req.query;
    try {
        const deletedTodo = await Todo.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(200).json({ message: 'Todo deleted successfully', deletedTodo });
    } catch (error) {
        const err = createHttpError(500, 'Internal Server Error');
        return next(err);
    }
};

export { createTodo, getAllTodos, updateTodo, deleteTodo, completeTodo };
