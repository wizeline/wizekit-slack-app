const datastore = require('../config/datastore');
const { getToDate } = require('../util/date-util');

const COMMAND_KIND = 'COMMANDS';
const excludeFromIndexes = ['text'];
/**
 * Return inserted key.
 * @param {*} cmdBody
 */
async function save(cmdBody) {
  const commandBody = { ...cmdBody };
  const currentTimestamp = new Date().toJSON();
  const key = datastore.key([COMMAND_KIND]);
  /* eslint-disable no-param-reassign */
  delete commandBody.response_url;
  delete commandBody.token;
  delete commandBody.trigger_id;
  /* eslint-enable no-param-reassign */

  const commandEntity = {
    key,
    excludeFromIndexes,
    data: {
      ...commandBody,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    },
  };
  await datastore.save(commandEntity);
  return commandEntity;
}

async function findByIds(ids = []) {
  const keys = ids.map((id) => datastore.key([COMMAND_KIND, datastore.int(id)]));
  const response = await datastore.get(keys);
  return response[0];
}

async function search(
  offset = 0,
  limit = -1,
  orderBy = 'createdAt',
  fromDate = '1999-01-01',
  toDate,
) {
  const rToDate = getToDate(toDate);
  const query = datastore
    .createQuery(COMMAND_KIND)
    .filter('createdAt', '<', rToDate)
    .filter('createdAt', '>', fromDate)
    .limit(limit)
    .order(orderBy, {
      descending: true,
    })
    .offset(offset);
  const response = await datastore.runQuery(query);
  return response[0];
}

module.exports = {
  save,
  findByIds,
  search,
};
