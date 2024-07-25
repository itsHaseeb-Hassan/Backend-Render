import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: String,
    required: true,
    trim: true
  },
  completed: {   
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
