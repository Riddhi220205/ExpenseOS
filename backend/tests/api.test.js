const request = require('supertest');
const app = require('../server');

describe('Expense Tracker API', () => {
  let createdId;

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /api/expenses creates an expense', async () => {
    const res = await request(app).post('/api/expenses').send({
      title: 'Test Coffee',
      amount: 4.5,
      category: 'Food',
      date: '2024-01-15',
      note: 'Morning latte'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Coffee');
    expect(res.body.amount).toBe(4.5);
    createdId = res.body.id;
  });

  test('POST /api/expenses rejects missing fields', async () => {
    const res = await request(app).post('/api/expenses').send({ title: 'Incomplete' });
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/expenses returns array', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/expenses/summary returns summary', async () => {
    const res = await request(app).get('/api/expenses/summary');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('byCategory');
  });

  test('PUT /api/expenses/:id updates an expense', async () => {
    const res = await request(app)
      .put(`/api/expenses/${createdId}`)
      .send({ amount: 5.0 });
    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBe(5.0);
  });

  test('DELETE /api/expenses/:id deletes an expense', async () => {
    const res = await request(app).delete(`/api/expenses/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Deleted successfully');
  });

  test('GET /api/expenses/:id returns 404 for missing', async () => {
    const res = await request(app).get('/api/expenses/99999');
    expect(res.statusCode).toBe(404);
  });
});
