import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.get('/:goalId', getTasks);
router.post('/:goalId', createTask);
router.put('/task/:id', updateTask);
router.delete('/task/:id', deleteTask);

export default router;