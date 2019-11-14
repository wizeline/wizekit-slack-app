const { name: originName } = require('../../package.json');
const { Datastore } = require('@google-cloud/datastore');
const COMMAND_KIND = 'COMMANDS';
const excludeFromIndexes = 'text';

const datastore = new Datastore({
  projectId: process.env.GCP_PROJECT,
  namespace: originName
});

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
  await datastore.insert(commandEntity);
  return commandEntity;
}

async function edit( id, commandBody) {
  const currentTimestamp = new Date().toJSON();
  const key = datastore.key([COMMAND_KIND, id]);
  const commandEntity = {
    key,
    excludeFromIndexes,
    data: {
      ...commandBody,
      processed: true,
      updatedAt: currentTimestamp
    }
  };
  await datastore.upsert(commandEntity);
  return commandEntity;
}

module.exports = {
  save, edit
};
