import prisma from '../config/database.js';

const parsePositiveInt = (val) => {
  const num = Number(val);
  return Number.isInteger(num) && num > 0 ? num : null;
};

// POST /questions
export const createQuestion = async (req, res) => {
  try {
    const { enunciado, dificuldade, respostaCorreta, subjectId, authorId, ativa } = req.body;

    if (!enunciado || typeof enunciado !== 'string' || enunciado.trim() === '') {
      return res.status(400).json({ success: false, message: 'O campo enunciado é obrigatório.' });
    }

    const diff = Number(dificuldade);
    if (!Number.isInteger(diff) || ![1, 2, 3].includes(diff)) {
      return res.status(400).json({ success: false, message: 'Dificuldade deve ser 1, 2 ou 3.' });
    }

    const validSubjectId = parsePositiveInt(subjectId);
    const validAuthorId = parsePositiveInt(authorId);

    if (!validSubjectId || !validAuthorId) {
      return res.status(400).json({ success: false, message: 'subjectId e authorId devem ser inteiros positivos.' });
    }

    const subject = await prisma.subject.findUnique({ where: { id: validSubjectId } });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Matéria não encontrada.' });
    }

    const author = await prisma.user.findUnique({ where: { id: validAuthorId } });
    if (!author) {
      return res.status(404).json({ success: false, message: 'Autor não encontrado.' });
    }

    const newQuestion = await prisma.question.create({
      data: {
        enunciado: enunciado.trim(),
        dificuldade: diff,
        respostaCorreta: respostaCorreta ? String(respostaCorreta) : null,
        subjectId: validSubjectId,
        authorId: validAuthorId,
        ativa: typeof ativa === 'boolean' ? ativa : true
      },
      include: {
        subject: {
          select: { id: true, nome: true }
        },
        author: {
          select: { id: true, nome: true, email: true }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: newQuestion,
      ...newQuestion
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

// GET /questions
export const getQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        subject: {
          select: { id: true, nome: true }
        },
        author: {
          select: { id: true, nome: true, email: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: questions,
      total: questions.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

// GET /questions/:id
export const getQuestionById = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID inválido. Deve ser um inteiro positivo.' });
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        subject: {
          select: { id: true, nome: true }
        },
        author: {
          select: { id: true, nome: true, email: true }
        }
      }
    });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Questão não encontrada.' });
    }

    return res.status(200).json({
      success: true,
      data: question,
      ...question
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};