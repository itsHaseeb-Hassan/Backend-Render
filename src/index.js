import express from 'express';
import dotenv from 'dotenv';
import userRouter from './routes/userRoute.js';
import todoRouter from './routes/todoRoute.js';
import connectDB from './config/db/db.js';
import cors from 'cors';

dotenv.config();

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5173', 'https://todo-frontend-xi.vercel.app'], // Add all allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    credentials: true // Allow cookies to be sent with requests
};
app.use(cors(corsOptions));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './src/views'); // Ensure this path is correct relative to your project structure

// Root route
app.get('/', (req, res) => {
    res.send('Hello this is my Todo Application'); // Ensure 'verified/index.ejs' exists
});

// API routes
app.use('/api/users', userRouter);
app.use('/api/todos', todoRouter);

// Connect to database and start the server
connectDB().then(() => {
    const PORT = process.env.PORT || 5000; // Default to port 5000 if PORT is not set
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Database connection failed:', error.message);
});

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

export default app;
