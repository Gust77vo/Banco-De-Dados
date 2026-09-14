import prisma from '../config/database.js';
import { questionService } from '../services/questionService.js';

const parsePositiveInt = (val) => {
  const num = Number(val);
  return Number.isInteger(num) && num > 0 ? num : null;
};

// POST /questions
export const createQuestion = async (req, res) => {
  try {
    const {
      enunciado,
      dificuldade,
      respostaCorreta,
      subjectId,
      disciplina_id,
      authorId,
      autor_id,
      ativa
    } = req.body;
    const resolvedSubjectId = subjectId ?? disciplina_id;
    const resolvedAuthorId = authorId ?? autor_id;

    // 1. Validações de sintaxe/formato (400 Bad Request)
    if (!enunciado || typeof enunciado !== 'string' || enunciado.trim() === '') {
      return res.status(400).json({ success: false, message: 'O campo enunciado é obrigatório.' });
    }

    const diff = Number(dificuldade);
    if (!Number.isInteger(diff) || ![1, 2, 3].includes(diff)) {
      return res.status(400).json({ success: false, message: 'Dificuldade deve ser 1, 2 ou 3.' });
    }

    if (respostaCorreta !== undefined && respostaCorreta !== null && typeof respostaCorreta !== 'string') {
      return res.status(400).json({ success: false, message: 'respostaCorreta deve ser texto ou null.' });
    }

    const validSubjectId = parsePositiveInt(resolvedSubjectId);
    if (!validSubjectId) {
      return res.status(400).json({ success: false, message: 'subjectId deve ser um inteiro positivo.' });
    }

    const validAuthorId = parsePositiveInt(resolvedAuthorId);
    if (!validAuthorId) {
      return res.status(400).json({ success: false, message: 'authorId deve ser um inteiro positivo.' });
    }

    // 2. Validações de existência no banco (404 Not Found)
    const subject = await prisma.subject.findUnique({ where: { id: validSubjectId } });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Matéria não encontrada.' });
    }

    const author = await prisma.user.findUnique({ where: { id: validAuthorId } });
    if (!author) {
      return res.status(404).json({ success: false, message: 'Autor não encontrado.' });
    }

    const newQuestion = await questionService.create({
      enunciado: enunciado.trim(),
      dificuldade: diff,
      respostaCorreta: respostaCorreta === null ? null : (respostaCorreta ? String(respostaCorreta).trim() : null),
      subjectId: validSubjectId,
      authorId: validAuthorId,
      ativa: typeof ativa === 'boolean' ? ativa : true
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
    const questions = await questionService.getAll();

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

    const question = await questionService.getById(id);

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

// PATCH /questions/:id
export const updateQuestion = async (req, res) => {
  try {
    // 1. Validar ID da URL (400 Bad Request)
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID inválido. Deve ser um inteiro positivo.' });
    }

    const {
      enunciado,
      respostaCorreta,
      dificuldade,
      ativa,
      subjectId,
      disciplina_id,
      authorId,
      autor_id
    } = req.body;
    const resolvedSubjectId = subjectId ?? disciplina_id;
    const resolvedAuthorId = authorId ?? autor_id;

    // 2. Validar se ao menos um campo válido foi enviado (400 Bad Request)
    if (
      enunciado === undefined &&
      respostaCorreta === undefined &&
      dificuldade === undefined &&
      ativa === undefined &&
      subjectId === undefined &&
      disciplina_id === undefined &&
      authorId === undefined &&
      autor_id === undefined
    ) {
      return res.status(400).json({ success: false, message: 'Envie ao menos um campo para atualização.' });
    }

    const updateData = {};

    // 3. Validações de tipo/formato dos campos enviados (400 Bad Request)
    if (enunciado !== undefined) {
      if (typeof enunciado !== 'string' || enunciado.trim() === '') {
        return res.status(400).json({ success: false, message: 'O enunciado não pode ser vazio.' });
      }
      updateData.enunciado = enunciado.trim();
    }

    if (respostaCorreta !== undefined) {
      if (respostaCorreta !== null && typeof respostaCorreta !== 'string') {
        return res.status(400).json({ success: false, message: 'respostaCorreta deve ser texto ou null.' });
      }
      updateData.respostaCorreta = respostaCorreta === null ? null : respostaCorreta.trim();
    }

    if (dificuldade !== undefined) {
      const diff = Number(dificuldade);
      if (!Number.isInteger(diff) || ![1, 2, 3].includes(diff)) {
        return res.status(400).json({ success: false, message: 'Dificuldade deve ser 1, 2 ou 3.' });
      }
      updateData.dificuldade = diff;
    }

    if (ativa !== undefined) {
      if (typeof ativa !== 'boolean') {
        return res.status(400).json({ success: false, message: 'O campo ativa deve ser booleano.' });
      }
      updateData.ativa = ativa;
    }

    // 4. Validações de existência dos relacionamentos (404 Not Found)
    if (resolvedSubjectId !== undefined) {
      const validSubjectId = parsePositiveInt(resolvedSubjectId);
      if (!validSubjectId) {
        return res.status(400).json({ success: false, message: 'subjectId deve ser um inteiro positivo.' });
      }

      const subject = await prisma.subject.findUnique({ where: { id: validSubjectId } });
      if (!subject) {
        return res.status(404).json({ success: false, message: 'Matéria informada não existe.' });
      }

      updateData.subjectId = validSubjectId;
    }

    if (resolvedAuthorId !== undefined) {
      const validAuthorId = parsePositiveInt(resolvedAuthorId);
      if (!validAuthorId) {
        return res.status(400).json({ success: false, message: 'authorId deve ser um inteiro positivo.' });
      }

      const author = await prisma.user.findUnique({ where: { id: validAuthorId } });
      if (!author) {
        return res.status(404).json({ success: false, message: 'Autor informado não existe.' });
      }

      updateData.authorId = validAuthorId;
    }

    // 5. SOMENTE AGORA verifica se a questão alvo existe (404 Not Found)
    const existingQuestion = await questionService.getById(id);
    if (!existingQuestion) {
      return res.status(404).json({ success: false, message: 'Questão não encontrada.' });
    }

    const updatedQuestion = await questionService.update(id, updateData);

    return res.status(200).json({
      success: true,
      data: updatedQuestion,
      ...updatedQuestion
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

// DELETE /questions/:id
export const deleteQuestion = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID inválido. Deve ser um inteiro positivo.' });
    }

    const existingQuestion = await questionService.getById(id);
    if (!existingQuestion) {
      return res.status(404).json({ success: false, message: 'Questão não encontrada.' });
    }

    const deletedQuestion = await questionService.delete(id);

    return res.status(200).json({
      success: true,
      message: 'Questão removida com sucesso.',
      data: {
        id: deletedQuestion.id
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};