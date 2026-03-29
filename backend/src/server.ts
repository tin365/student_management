import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Route Imports
import expenseRoutes from './routes/expenseRoutes.js';
import studySessionRoutes from './routes/studySessionRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';

// API Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Basic Root Route
app.get('/', (req, res) => {
  res.send('Khai API is running...');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
