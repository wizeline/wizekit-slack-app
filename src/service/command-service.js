const {datastore }= require('../config/datastore');
const COMMAND_KIND = 'COMMANDS';
const excludeFromIndexes = ['text'];

async function save(commandBody) {
  const currentTimestamp = new Date().toJSON();
  const key = datastore.key([COMMAND_KIND]);

  delete commandBody.response_url;
  delete commandBody.token;
  delete commandBody.trigger_id;

  const commandEntity = {
    key,
    excludeFromIndexes,
    data: {
      ...commandBody,
      processed: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp
    }
  };
  const response = await datastore.save(commandEntity);
  return response[0];
}

async function findByIds(ids = []) {
  const keys = ids.map(id => datastore.key([COMMAND_KIND, datastore.int(id)]));
  const response = await datastore.get(keys);
  return response[0];
}

async function edit( id, commandBody) {
  const currentTimestamp = new Date().toJSON();
  const key = datastore.key([COMMAND_KIND, datastore.int(id)]);
  const commandEntity = {
    key,
    excludeFromIndexes,
    data: {
      ...commandBody,
      processed: true,
      updatedAt: currentTimestamp
    }
  };
  const response = await datastore.upsert(commandEntity);
  return response[0];
}

module.exports = {
  save, edit, findByIds
};
