import express from 'express';
import { getStudySessions, createStudySession, updateStudySession, deleteStudySession } from '../controllers/studySessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getStudySessions);
router.post('/', createStudySession);
router.put('/:id', updateStudySession);
router.delete('/:id', deleteStudySession);

export default router;
