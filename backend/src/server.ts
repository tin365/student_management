import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Route Imports
import expenseRoutes from './routes/expenseRoutes';
import goalRoutes from './routes/goalRoutes';
import studySessionRoutes from './routes/studySessionRoutes';
import scheduleRoutes from './routes/scheduleRoutes';

// API Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/schedules', scheduleRoutes);

// Basic Root Route
app.get('/', (req, res) => {
  res.send('Khai API is running...');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
