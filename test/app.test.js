require('./setup');
const request = require('supertest');
const packageJson = require('../package.json');

jest.mock('../src/config/authentication.js', () => ({
  verifyJwtToken: () => jest.fn(),
}));

jest.mock('../src/config/firebase.js', () => ({}));

const app = require('../src/app');

describe('test web endpoints', () => {
  describe('actuator endpoint', () => {
    it('contains ok message ', (done) => {
      request(app)
        .get('/health')
        .expect(200, { message: 'I\'m OK.' }, done);
    });

    it('contains ok message ', (done) => {
      request(app)
        .get('/info')
        .expect(200, { description: 'WizeKit Slack App', version: packageJson.version }, done);
    });
  });

  describe('index endpoint', () => {
    it('contains ok message ', (done) => {
      request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200, RegExp('WizeKit Slack App Dashboard'), done);
    });
  });
});
