import prisma from '../config/database.js';

export const subjectService = {
  async getAll() {
    return await prisma.subject.findMany({
      include: {
        professor: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
  },

  async getById(id) {
    return await prisma.subject.findUnique({
      where: { id: Number(id) },
      include: {
        professor: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
  },

  async create(data) {
    return await prisma.subject.create({
      data,
      include: {
        professor: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
  },

  async update(id, data) {
    return await prisma.subject.update({
      where: { id: Number(id) },
      data,
      include: {
        professor: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
  },

  async delete(id) {
    const subjectId = Number(id);

    // Regra: Não pode excluir matéria com questões vinculadas
    const questionsCount = await prisma.question.count({
      where: { subjectId }
    });

    if (questionsCount > 0) {
      const error = new Error('Uma matéria com questões vinculadas não pode ser excluída.');
      error.statusCode = 409;
      throw error;
    }

    return await prisma.subject.delete({
      where: { id: subjectId }
    });
  }
};