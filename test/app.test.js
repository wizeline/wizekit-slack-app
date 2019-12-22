const request = require('supertest');

process.env.PORT = 3001;
const app = require('../app');

describe('test web endpoints', () => {
  describe('health check /', () => {
    it('should contains ok message ', (done) => {
      request(app)
        .get('/healthcheck')
        .expect(200, { message: 'I\'m OK.' }, done);
    });

describe('test web endpoints', () => {
  describe('health check /', () => {
    it('should contains ok message ', (done) => {
      request(app)
        .get('/api/healthcheck')
        .expect(200, { message: 'I\'m OK.' }, done);
    });
  });
});
