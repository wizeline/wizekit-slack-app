const { name: originName } = require('../../package.json');
const { Datastore } = require('@google-cloud/datastore');
const COMMAND_KIND = 'USERS';

const datastore = new Datastore({
  projectId: process.env.GCP_PROJECT,
  namespace: originName
});

async function save(commandBody) {
  const currentTimestamp = new Date().toJSON();
  const key = datastore.key([COMMAND_KIND]);
  const commandEntity = {
    key,
    data: {
      ...commandBody,
      processed: false,
      createdAt: currentTimestamp
    }
  };
  await datastore.upsert(commandEntity);
  return commandEntity;
}

module.exports = {
  save
};
