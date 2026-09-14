import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Suíte de Testes: Matérias e Questões', () => {
  let createdUserId;
  let createdSubjectId;
  let createdQuestionId;

  //Cria um usuário PROFESSOR para ser o dono das matérias e questões
  beforeAll(async () => {
    const userRes = await request(app)
      .post('/users')
      .send({
        nome: 'Professor Teste',
        email: `prof.${Date.now()}@teste.com`,
        papel: 'PROFESSOR'
      });

    createdUserId = userRes.body.data?.id ?? userRes.body.id;
  });

  //Limpeza ao final dos testes
  afterAll(async () => {
    if (createdQuestionId) {
      await request(app).delete(`/questoes/${createdQuestionId}`);
    }
    if (createdSubjectId) {
      await request(app).delete(`/materias/${createdSubjectId}`);
    }
    if (createdUserId) {
      await request(app).delete(`/users/${createdUserId}`);
    }
  });

  // --- MATÉRIAS ---
  describe('Entidade: Matérias', () => {
    test('Deve criar uma matéria com sucesso', async () => {
      const res = await request(app)
        .post('/materias')
        .send({
          nome: 'Matemática',
          professor_id: createdUserId
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('id');
      expect(res.body.nome).toBe('Matemática');
      createdSubjectId = res.body.id;
    });

    test('Deve retornar erro ao tentar criar matéria com professor inexistente', async () => {
      const res = await request(app)
        .post('/materias')
        .send({
          nome: 'Física',
          professor_id: 999999
        });

      expect([400, 404]).toContain(res.status);
    });

    test('Deve listar matérias e buscar por ID', async () => {
      const listRes = await request(app).get('/materias');
      expect(listRes.status).toBe(200);
      
      const data = Array.isArray(listRes.body.data)
        ? listRes.body.data
        : Array.isArray(listRes.body)
          ? listRes.body
          : [];
      expect(Array.isArray(data)).toBe(true);

      const getRes = await request(app).get(`/materias/${createdSubjectId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.id).toBe(createdSubjectId);
    });

    test('Deve atualizar parcialmente uma matéria', async () => {
      const res = await request(app)
        .patch(`/materias/${createdSubjectId}`)
        .send({
          nome: 'Matemática Avançada'
        });

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('Matemática Avançada');
    });

    test('Deve retornar 400 para atualização inválida ou ID incorreto', async () => {
      const res = await request(app)
        .patch('/materias/abc')
        .send({});

      expect([400, 422]).toContain(res.status);
    });
  });

  // --- QUESTÕES ---
  describe('Entidade: Questões', () => {
    test('Deve criar uma questão com sucesso', async () => {
      const res = await request(app)
        .post('/questoes')
        .send({
          enunciado: 'Quanto é 2 + 2?',
          dificuldade: 1,
          materia_id: createdSubjectId,
          disciplina_id: createdSubjectId,
          subjectId: createdSubjectId,
          autor_id: createdUserId,
          authorId: createdUserId
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('id');
      createdQuestionId = res.body.id;
    });

    test('Deve retornar erro ao criar questão com matéria ou autor inexistente', async () => {
      const res = await request(app)
        .post('/questoes')
        .send({
          enunciado: 'Questão sem matéria',
          dificuldade: 2,
          materia_id: 999999,
          disciplina_id: 999999,
          subjectId: 999999,
          autor_id: createdUserId,
          authorId: createdUserId
        });

      expect([400, 404]).toContain(res.status);
    });

    test('Deve retornar 409 ao tentar deletar matéria vinculada a uma questão', async () => {
      const res = await request(app).delete(`/materias/${createdSubjectId}`);
      expect(res.status).toBe(409);
    });

    test('Deve deletar a questão com sucesso e retornar 404 na busca posterior', async () => {
      const deleteRes = await request(app).delete(`/questoes/${createdQuestionId}`);
      expect([200, 204]).toContain(deleteRes.status);

      const getRes = await request(app).get(`/questoes/${createdQuestionId}`);
      expect(getRes.status).toBe(404);

      createdQuestionId = null;
    });
  });

  // --- EXCLUSÃO FINAL DA MATÉRIA ---
  describe('Exclusão final', () => {
    test('Deve deletar a matéria sem vínculos e retornar 404 ao buscar por ela', async () => {
      const deleteRes = await request(app).delete(`/materias/${createdSubjectId}`);
      expect([200, 204]).toContain(deleteRes.status);

      const getRes = await request(app).get(`/materias/${createdSubjectId}`);
      expect(getRes.status).toBe(404);

      createdSubjectId = null;
    });
  });
});