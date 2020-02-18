const MIN_MSG_LENGTH = 20;

function validateMsgLength(msg) {
  return msg && msg.replace(/<\S+>/gm, '').trim().length > MIN_MSG_LENGTH;
}

module.exports = {
  validateMsgLength,
};
