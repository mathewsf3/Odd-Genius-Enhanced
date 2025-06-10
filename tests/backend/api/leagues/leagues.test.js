const request = require('supertest');
const app = require('../../../../src/app');

describe('Leagues API Integration Tests', () => {
  test('GET /api/leagues returns correct response', async () => {
    const response = await request(app)
      .get('/api/leagues')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toMatchObject({
      success: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          country: expect.any(String)
        })
      ])
    });
  });

  test('API error handling works correctly', async () => {
    const response = await request(app)
      .get('/api/leagues/invalid')
      .expect(404);

    expect(response.body).toMatchObject({
      success: false,
      error: expect.any(String)
    });
  });
});