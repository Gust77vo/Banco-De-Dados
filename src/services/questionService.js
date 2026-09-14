import prisma from '../config/database.js';

export const questionService = {
  async getAll() {
    return await prisma.question.findMany({
      include: {
        subject: {
          select: { id: true, nome: true }
        },
        author: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
  },

  async getById(id) {
    return await prisma.question.findUnique({
      where: { id: Number(id) },
      include: {
        subject: {
          select: { id: true, nome: true }
        },
        author: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
  },

  async create(data) {
    return await prisma.question.create({
      data,
      include: {
        subject: {
          select: { id: true, nome: true }
        },
        author: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
  },

  async update(id, data) {
    return await prisma.question.update({
      where: { id: Number(id) },
      data,
      include: {
        subject: {
          select: { id: true, nome: true }
        },
        author: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
  },

  async delete(id) {
    return await prisma.question.delete({
      where: { id: Number(id) }
    });
  }
};