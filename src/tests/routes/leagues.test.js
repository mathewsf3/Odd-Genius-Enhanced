const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');
const { League } = require('../../models');
const { createTestLeagues, cleanupTestLeagues } = require('../testUtils');

describe('GET /api/leagues', () => {
  let testLeagues;

  before(async () => {
    testLeagues = await createTestLeagues();
  });

  after(async () => {
    await cleanupTestLeagues();
  });

  it('should return 200 and all active leagues', async () => {
    const response = await request(app)
      .get('/api/leagues')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.have.property('leagues');
    expect(response.body.leagues).to.be.an('array');
    expect(response.body.leagues.length).to.be.greaterThan(0);
    
    const league = response.body.leagues[0];
    expect(league).to.have.all.keys([
      'id',
      'name',
      'status',
      'startDate',
      'endDate',
      'isActive'
    ]);
  });

  it('should filter leagues by status when query param is provided', async () => {
    const response = await request(app)
      .get('/api/leagues?status=upcoming')
      .expect(200);

    expect(response.body.leagues).to.be.an('array');
    response.body.leagues.forEach(league => {
      expect(league.status).to.equal('upcoming');
    });
  });

  it('should handle invalid status parameter', async () => {
    const response = await request(app)
      .get('/api/leagues?status=invalid')
      .expect(400);

    expect(response.body).to.have.property('error');
  });
});