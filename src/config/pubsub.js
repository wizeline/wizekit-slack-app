const { PubSub } = require('@google-cloud/pubsub');

const pubsub = new PubSub({
  projectId: process.env.GCP_PROJECT
});

module.exports = {
  pubsub
}
