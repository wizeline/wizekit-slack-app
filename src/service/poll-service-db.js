const datastore = require('../config/datastore');

const POLL_KIND = 'POLL';

async function save(poll = []) {
  if (poll.length === 0) {
    return poll;
  }
  const currentTimestamp = new Date().toJSON();
  const entities = poll.map((kudo) => {
    const key = datastore.key([POLL_KIND]);
    return {
      key,
      data: {
        ...kudo,
        createdAt: currentTimestamp,
      },
    };
  });

  return datastore.save(entities);
}

module.exports = {
  save,
};
