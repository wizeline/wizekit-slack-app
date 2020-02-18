const { Datastore } = require('@google-cloud/datastore');
const { name: originNameSpace } = require('../../package.json');

const datastore = new Datastore({
  projectId: process.env.GCP_PROJECT,
  namespace: originNameSpace,
});

module.exports = {
  datastore,
};
