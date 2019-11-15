const {datastore }= require('../config/datastore');
const KUDOS_KIND = 'KUDOS';

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

  const response = await datastore.save(entities);
  return response[0];
}

async function search(){
  const query = datastore.createQuery(KUDOS_KIND);
  const response = await datastore.runQuery(query);
  return response[0];
}

module.exports = {
  save,
  search
};
