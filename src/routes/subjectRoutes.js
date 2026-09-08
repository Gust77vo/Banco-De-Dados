import { Router } from 'express';
import {
  createSubject,
  getSubjects,
  getSubjectById
} from '../controllers/subjectController.js';

const router = Router();

router.post('/', createSubject);
router.get('/', getSubjects);
router.get('/:id', getSubjectById);

export default router;