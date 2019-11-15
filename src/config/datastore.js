const { name: originNameSpace } = require('../../package.json');
const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore({
  projectId: process.env.GCP_PROJECT,
  namespace: originNameSpace
});

module.exports = {
  datastore
}
