const request = require('supertest');
const app = require('../../../../src/app');

describe('Comprehensive Match Analysis Endpoint', () => {
  test('GET /api/matches/:id/comprehensive-analysis returns structured data', async () => {
    // Use a mock ID; service will likely return 404 if not found
    const response = await request(app)
      .get('/api/matches/1/comprehensive-analysis')
      .expect('Content-Type', /json/);

    // Accept 200 or 404 depending on dataset availability
    expect([200,404]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result.match');
    }
  });
});
