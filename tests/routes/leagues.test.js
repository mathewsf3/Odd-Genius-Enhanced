const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const db = require('../../src/db/connection');

describe('Leagues API Endpoints', () => {
  before(async () => {
    // Ensure database connection is established
    await db.connect();
  });

  after(async () => {
    // Close database connection after tests
    await db.end();
  });

  describe('GET /api/leagues', () => {
    it('should return all leagues', async () => {
      const response = await request(app)
        .get('/api/leagues')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      
      // Verify league object structure
      const league = response.body[0];
      expect(league).to.have.property('id');
      expect(league).to.have.property('name');
      expect(league).to.have.property('country');
    });

    it('should handle database errors gracefully', async () => {
      // Temporarily break database connection
      await db.end();
      
      const response = await request(app)
        .get('/api/leagues')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).to.have.property('error');
      
      // Restore connection for other tests
      await db.connect();
    });
  });
});