import { Router } from 'express';
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} from '../controllers/questionController.js';

const router = Router();

router.post('/', createQuestion);
router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.patch('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;