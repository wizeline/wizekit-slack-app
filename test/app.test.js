require('./setup');
const request = require('supertest');

jest.mock('../src/config/authentication.js', () => ({
  verifyJwtToken: () => jest.fn(),
}));

const app = require('../src/server');

describe('test web endpoints', () => {
  describe('health check /', () => {
    it('should contains ok message ', (done) => {
      request(app)
        .get('/healthcheck')
        .expect(200, { message: 'I\'m OK.' }, done);
    });
  });
});
