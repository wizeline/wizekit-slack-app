const pollService = require('./poll-service');

const mockPost = jest.fn();

jest.mock('axios', () => ({
  default: {
    post: jest.fn().mockImplementation((url, data) => mockPost(url, data)),
  },
}));

describe('poll service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('should be ok', () => {
    const requestBody = {
      text: '"what ?" "a" "b" ',
      response_url: 'https://slack.com/api/v1',
      user_id: '12312',
      command: '/wizepoll',
    };
    pollService.processWizePoll(requestBody);
    expect(mockPost).toBeCalledWith('https://slack.com/api/v1', {
      blocks: [{ accessory: { options: [{ text: { emoji: true, text: 'Just :smile:', type: 'plain_text' }, value: 'just-simle' }, { text: { emoji: true, text: ':x: Delete Poll', type: 'plain_text' }, value: 'delete-poll-12312' }, { text: { emoji: true, text: ':call_me_hand: Need help', type: 'plain_text' }, value: 'need-help' }], type: 'overflow' }, text: { text: '*What ?*', type: 'mrkdwn' }, type: 'section' }, {
        accessory: {
          action_id: 'multiple-identified-0', style: 'primary', text: { text: ':one:', type: 'plain_text' }, type: 'button',
        },
        text: { text: ':one: a', type: 'mrkdwn' },
        type: 'section',
      }, {
        accessory: {
          action_id: 'multiple-identified-1', style: 'primary', text: { text: ':two:', type: 'plain_text' }, type: 'button',
        },
        text: { text: ':two: b', type: 'mrkdwn' },
        type: 'section',
      }, { elements: [{ text: 'Created by <@12312> with `/wizepoll` :rocket:. Powered by <https://www.wizeline.com|Wizeline>', type: 'mrkdwn' }], type: 'context' }],
      response_type: 'in_channel',
    });
  });
});
