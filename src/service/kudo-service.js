const { name: originNameSpace } = require('../../package.json');
const { Datastore } = require('@google-cloud/datastore');
const KUDOS_KIND = 'KUDOS';

const datastore = new Datastore({
  projectId: process.env.GCP_PROJECT,
  namespace: originNameSpace,
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
    const key = datastore.key([KUDOS_KIND]);
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

async function search(){
  const query = datastore.createQuery(originNameSpace, KUDOS_KIND);
  return datastore.runQuery(query);
}

module.exports = {
  save,
  search
};
