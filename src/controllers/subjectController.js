import prisma from '../config/database.js';
import { subjectService } from '../services/subjectService.js';

const parsePositiveInt = (val) => {
  const num = Number(val);
  return Number.isInteger(num) && num > 0 ? num : null;
};

// GET /subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await subjectService.getAll();
    return res.status(200).json({
      success: true,
      data: subjects,
      total: subjects.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

// GET /subjects/:id
export const getSubjectById = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID inválido. Deve ser um inteiro positivo.' });
    }

    const subject = await subjectService.getById(id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Matéria não encontrada.' });
    }

    return res.status(200).json({
      success: true,
      data: subject,
      ...subject
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

// POST /subjects
export const createSubject = async (req, res) => {
  try {
    const { nome, professorId, professor_id, ativa } = req.body;
    const resolvedProfessorId = professorId ?? professor_id;

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return res.status(400).json({ success: false, message: 'O campo nome é obrigatório.' });
    }

    const validProfessorId = parsePositiveInt(resolvedProfessorId);
    if (!validProfessorId) {
      return res.status(400).json({ success: false, message: 'professorId deve ser um inteiro positivo.' });
    }

    const professor = await prisma.user.findUnique({
      where: { id: validProfessorId }
    });

    if (!professor) {
      return res.status(404).json({ success: false, message: 'Professor informado não existe.' });
    }

    const newSubject = await subjectService.create({
      nome: nome.trim(),
      professorId: validProfessorId,
      ativa: typeof ativa === 'boolean' ? ativa : true
    });

    return res.status(201).json({
      success: true,
      data: newSubject,
      ...newSubject
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

// PATCH /subjects/:id
export const updateSubject = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID inválido. Deve ser um inteiro positivo.' });
    }

    const { nome, ativa, professorId, professor_id } = req.body;
    const resolvedProfessorId = professorId ?? professor_id;

    // Exige ao menos um campo válido enviado
    if (nome === undefined && ativa === undefined && professorId === undefined && professor_id === undefined) {
      return res.status(400).json({ success: false, message: 'Envie ao menos um campo para atualização.' });
    }

    const updateData = {};

    // Validação de nome
    if (nome !== undefined) {
      if (typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({ success: false, message: 'O nome não pode ser vazio.' });
      }
      updateData.nome = nome.trim();
    }

    // Validação de ativa
    if (ativa !== undefined) {
      if (typeof ativa !== 'boolean') {
        return res.status(400).json({ success: false, message: 'O campo ativa deve ser booleano.' });
      }
      updateData.ativa = ativa;
    }

    // Validação do novo professor
    if (resolvedProfessorId !== undefined) {
      const validProfessorId = parsePositiveInt(resolvedProfessorId);
      if (!validProfessorId) {
        return res.status(400).json({ success: false, message: 'professorId deve ser um inteiro positivo.' });
      }

      const professor = await prisma.user.findUnique({
        where: { id: validProfessorId }
      });

      if (!professor) {
        return res.status(404).json({ success: false, message: 'Professor informado não existe.' });
      }

      updateData.professorId = validProfessorId;
    }

    // Verifica existência da matéria
    const existingSubject = await subjectService.getById(id);
    if (!existingSubject) {
      return res.status(404).json({ success: false, message: 'Matéria não encontrada.' });
    }

    const updatedSubject = await subjectService.update(id, updateData);

    return res.status(200).json({
      success: true,
      data: updatedSubject,
      ...updatedSubject
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

// DELETE /subjects/:id
export const deleteSubject = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID inválido. Deve ser um inteiro positivo.' });
    }

    const existingSubject = await subjectService.getById(id);
    if (!existingSubject) {
      return res.status(404).json({ success: false, message: 'Matéria não encontrada.' });
    }

    const deletedSubject = await subjectService.delete(id);

    return res.status(200).json({
      success: true,
      message: 'Matéria removida com sucesso.',
      data: {
        id: deletedSubject.id
      }
    });
  } catch (error) {
    console.error(error);

    // Captura o status 409 vindo do serviço (matéria com questões)
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};