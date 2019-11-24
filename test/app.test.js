const request = require('supertest');
const app = require('../app');

describe('test command from slack', () => {
  describe('kudos command /', () => {
    it('should return response_type only ', (done) => {
      request(app)
        .post('/commands/kudos-me')
        .expect(200, {
          response_type: 'in_channel',
        }, done);
    });

    it('should get doesnt work message', (done) => {
      request(app)
        .post('/commands/kudos-me')
        .send('channel_name=directmessage&user_id=ABC')
        .expect(200, {
          response_type: 'in_channel',
          text: 'Hi <@ABC>, `/kudos` doesn\'t work on Direct Message or Private Channel',
        }, done);
    });
  });
});
