const request = require('supertest');
const app = require('../app');


describe('gae_node_request_example', () => {
  describe('GET /', () => {
    it('should get 200', (done) => {
      request(app)
        .get('/')
        .expect(200, done);
    });

    it('should get Hello World', (done) => {
      request(app)
        .get('/')
        .expect('Hello, world!', done);
    });
  });
});
