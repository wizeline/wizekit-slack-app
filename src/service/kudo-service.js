const { name: originName } = require('../../package.json');
const { Datastore } = require('@google-cloud/datastore');
const COMMAND_KIND = 'USERS';

const datastore = new Datastore({
  projectId: process.env.GCP_PROJECT,
  namespace: originName,
});

/**
 * List of Kudos objects.
 * @param {Array} kudos
 */
async function save(kudos) {
  if( kudos.length === 0 ){
    return [];
  }
  const currentTimestamp = new Date().toJSON();
  const entities = kudos.map(kudo=> {
    const key = datastore.key([COMMAND_KIND]);
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
