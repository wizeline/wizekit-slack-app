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

    it('should get ephemeral message', (done) => {
      request(app)
        .post('/commands/kudos-me')
        .send('user_id=ABC&text=shorter than 20 msg.')
        .expect(200, {
          response_type: 'ephemeral',
          text: 'Hi <@ABC>, `/kudos` is for encouraging people, please write something thoughtful.',
        }, done);
    });
  });
});
