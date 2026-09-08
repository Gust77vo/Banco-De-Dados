import prisma from '../config/database.js';

const parsePositiveInt = (val) => {
  const num = Number(val);
  return Number.isInteger(num) && num > 0 ? num : null;
};

// POST /subjects
export const createSubject = async (req, res) => {
  try {
    const { nome, professorId, ativa } = req.body;

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return res.status(400).json({ success: false, message: 'O campo nome é obrigatório.' });
    }

    const validProfessorId = parsePositiveInt(professorId);
    if (!validProfessorId) {
      return res.status(400).json({ success: false, message: 'professorId deve ser um inteiro positivo.' });
    }

    const professor = await prisma.user.findUnique({
      where: { id: validProfessorId }
    });

    if (!professor) {
      return res.status(404).json({ success: false, message: 'Professor informado não existe.' });
    }

    const newSubject = await prisma.subject.create({
      data: {
        nome: nome.trim(),
        professorId: validProfessorId,
        ativa: typeof ativa === 'boolean' ? ativa : true
      },
      include: {
        professor: {
          select: { id: true, nome: true, email: true }
        }
      }
    });

    // Envia tanto data quanto os campos na raiz para compatibilidade com o script do Bruno
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

// GET /subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        professor: {
          select: { id: true, nome: true, email: true }
        }
      }
    });

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

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        professor: {
          select: { id: true, nome: true, email: true }
        }
      }
    });

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