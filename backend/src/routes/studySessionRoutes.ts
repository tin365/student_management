import express from 'express';
import { getStudySessions, createStudySession, updateStudySession, deleteStudySession } from '../controllers/studySessionController';

const router = express.Router();

router.get('/', getStudySessions);
router.post('/', createStudySession);
router.put('/:id', updateStudySession);
router.delete('/:id', deleteStudySession);

export default router;
