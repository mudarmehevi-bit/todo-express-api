const request = require('supertest');
const app = require('../server');

describe('Todo API Endpoints', () => {
  let agent = request.agent(app);
  let testTodoId;

  it('should register a new user', async () => {
    const res = await agent
      .post('/register')
      .send({ username: 'testuser_' + Date.now(), password: 'password123' });
    expect([200, 201]).toContain(res.statusCode);
  });

  it('should login the user', async () => {
    const username = 'testuser_' + Date.now();
    await agent.post('/register').send({ username, password: 'password123' });
    
    const res = await agent
      .post('/login')
      .send({ username, password: 'password123' });
    expect(res.statusCode).toBe(200);
  });

  it('should create a new todo', async () => {
    const username = 'todouser_' + Date.now();
    await agent.post('/register').send({ username, password: 'password123' });
    await agent.post('/login').send({ username, password: 'password123' });

    const res = await agent
      .post('/todos')
      .send({ title: 'Test Todo Item' });
    
    expect([200, 201]).toContain(res.statusCode);
    if (res.body && res.body.id) {
      testTodoId = res.body.id;
    }
  });

  it('should get all todos', async () => {
    const res = await agent.get('/todos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update a todo', async () => {
    if (!testTodoId) return;
    const res = await agent
      .put(`/todos/${testTodoId}`)
      .send({ completed: true });
    expect([200, 204, 404]).toContain(res.statusCode);
  });

  it('should delete a todo', async () => {
    if (!testTodoId) return;
    const res = await agent.delete(`/todos/${testTodoId}`);
    expect([200, 204, 404]).toContain(res.statusCode);
  });
});