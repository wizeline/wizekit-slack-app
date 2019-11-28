const request = require('supertest');
const app = require('../app');

describe('test command from slack', () => {
  describe('kudos command /', () => {
    it('should return response_type only ', (done) => {
      request(app)
        .post('/commands/kudos-me')
        .send('text=this is a text message shuold longer than 20')
        .expect(200, {
          response_type: 'in_channel',
        }, done);
    });

    it('should get doesnt work message', (done) => {
      request(app)
        .post('/commands/kudos-me')
        .send('channel_name=directmessage&user_id=ABC&text=this is a text message shuold longer than 20')
        .expect(200, {
          response_type: 'in_channel',
          text: 'Hi <@ABC>, `/kudos` doesn\'t work on Direct Message or Private Channel',
        }, done);
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
